import { useState, useEffect, useCallback, useRef } from 'react';
import { getChatMessages } from '../services/chatService'; // Correct import

const useChatWebSocket = (partnerUserId, requestId = null, readOnly = false) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [partnerLocation, setPartnerLocation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [emergencyAlert, setEmergencyAlert] = useState(null);

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const unreadMessagesRef = useRef(new Set());
    const readReceiptBatchRef = useRef([]);
    const readReceiptTimeoutRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingSentRef = useRef(false);
    const lastLocationSentTimeRef = useRef(0);

    // Fetch initial chat history
    useEffect(() => {
        if (!partnerUserId) return;

        const loadHistory = async () => {
            try {
                const chatHistory = await getChatMessages(partnerUserId, requestId, 50, 0); // Use correct function
                const sorted = chatHistory.messages.sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
                setMessages(sorted);
            } catch (err) {
                console.error("Failed to load chat history:", err);
            }
        };

        loadHistory();
    }, [partnerUserId]);

    // Connect WebSocket
    const connect = useCallback(() => {
        if (!partnerUserId || readOnly) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const token = sessionStorage.getItem('token');
        if (!token) return;

        const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        const wsUrl = baseUrl.replace(/^http/, 'ws') + `/chat/ws?token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            reconnectAttempts.current = 0;
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'message':
                        setMessages((prev) => [...prev, data]);
                        break;
                    case 'message_sent':
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.placeholderId === data.placeholderId
                                    ? { ...msg, ...data, status: 'sent', placeholderId: undefined }
                                    : msg
                            )
                        );
                        break;
                    case 'typing':
                        if (String(data.senderId) === String(partnerUserId)) setIsTyping(data.isTyping);
                        break;
                    case 'receipt':
                        if (data.chat_ids?.length) {
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    data.chat_ids.includes(msg.chat_id)
                                        ? { ...msg, status: 'read' }
                                        : msg
                                )
                            );
                        }
                        break;
                    case 'location':
                        if (String(data.senderId) === String(partnerUserId))
                            setPartnerLocation({ lat: data.lat, lng: data.lng, timestamp: data.timestamp });
                        break;
                    case 'emergency':
                        if (String(data.senderId) === String(partnerUserId))
                            setEmergencyAlert(data);
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.error('Failed to parse WS message', err);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            wsRef.current = null;
            if (reconnectAttempts.current < maxReconnectAttempts) {
                const timeout = Math.min(10000, 1000 * 2 ** reconnectAttempts.current);
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectAttempts.current += 1;
                    connect();
                }, timeout);
            }
        };

        ws.onerror = () => ws.close();
    }, [partnerUserId]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect]);

    const sendMessage = useCallback(
        (text) => {
            const trimmed = text.trim();
            if (!trimmed || trimmed.length > 2000) return false;
            if (wsRef.current?.readyState !== WebSocket.OPEN) return false;

            const placeholderId = 'temp-' + Date.now();
            const payload = { type: 'message', receiverId: partnerUserId, message: trimmed, placeholderId, request_id: requestId };
            wsRef.current.send(JSON.stringify(payload));

            setMessages((prev) => [
                ...prev,
                { placeholderId, message: trimmed, senderId: 'me', created_at: new Date().toISOString(), status: 'sending' },
            ]);

            return true;
        },
        [partnerUserId]
    );

    const sendTyping = useCallback(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        if (!lastTypingSentRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'typing', receiverId: partnerUserId, isTyping: true }));
            lastTypingSentRef.current = true;
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'typing', receiverId: partnerUserId, isTyping: false }));
                lastTypingSentRef.current = false;
            }
        }, 1500);
    }, [partnerUserId]);

    const markAsRead = useCallback(
        (chatId) => {
            if (unreadMessagesRef.current.has(chatId)) return;
            unreadMessagesRef.current.add(chatId);
            readReceiptBatchRef.current.push(chatId);

            if (readReceiptTimeoutRef.current) clearTimeout(readReceiptTimeoutRef.current);

            readReceiptTimeoutRef.current = setTimeout(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN && readReceiptBatchRef.current.length) {
                    wsRef.current.send(
                        JSON.stringify({ type: 'read', receiverId: partnerUserId, chat_ids: [...readReceiptBatchRef.current] })
                    );
                    readReceiptBatchRef.current = [];
                }
            }, 500);
        },
        [partnerUserId]
    );

    const sendEmergency = useCallback(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return false;
        wsRef.current.send(JSON.stringify({ type: 'emergency', receiverId: partnerUserId }));
        return true;
    }, [partnerUserId]);

    return { 
        messages, isTyping, partnerLocation, isConnected, 
        sendMessage, sendTyping, markAsRead,
        emergencyAlert, setEmergencyAlert, sendEmergency
    };
};

export default useChatWebSocket;
