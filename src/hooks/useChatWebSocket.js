import { useState, useEffect, useCallback, useRef } from 'react';
import { getChatMessages } from '../services/chatService';
import api from '../api/axios';

const useChatWebSocket = (partnerUserId, requestId = null, readOnly = false) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [partnerLocation, setPartnerLocation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRestOnline, setIsRestOnline] = useState(true);
    const [emergencyAlert, setEmergencyAlert] = useState(null);

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 50;
    const pingIntervalRef = useRef(null);

    const unreadMessagesRef = useRef(new Set());
    const readReceiptBatchRef = useRef([]);
    const readReceiptTimeoutRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingSentRef = useRef(false);

    // Fetch initial chat history
    useEffect(() => {
        if (!partnerUserId) return;

        const loadHistory = async () => {
            try {
                const chatHistory = await getChatMessages(partnerUserId, requestId, 50, 0);
                const sorted = (chatHistory?.messages || []).sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
                setMessages(sorted);
            } catch (err) {
                console.error("Failed to load chat history:", err);
            }
        };

        loadHistory();
    }, [partnerUserId, requestId]);

    // Connect WebSocket
    const connect = useCallback(() => {
        if (!partnerUserId || readOnly) return;
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;

        const token = sessionStorage.getItem('token');
        if (!token) return;

        const DEFAULT_API_URL = 'https://shakham.francecentral.cloudapp.azure.com/sheconnect-be';
        const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? DEFAULT_API_URL : window.location.origin)).trim().replace(/\/+$/, '');
        const wsUrl = rawBaseUrl.replace(/^http/, 'ws') + `/chat/ws?token=${token}`;
        
        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                reconnectAttempts.current = 0;

                // Send heartbeat every 20s to prevent reverse-proxy timeouts
                if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = setInterval(() => {
                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        try {
                            wsRef.current.send(JSON.stringify({ type: 'ping' }));
                        } catch (err) {
                            console.warn("Ping failed", err);
                        }
                    }
                }, 20000);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case 'pong':
                            break;
                        case 'message':
                            console.log("Chat WS received message:", data);
                            setMessages((prev) => {
                                if (data.chat_id && prev.some((m) => m.chat_id === data.chat_id)) {
                                    return prev;
                                }
                                return [...prev, {
                                    chat_id: data.chat_id,
                                    senderId: data.senderId,
                                    message: data.message || data.text || '',
                                    created_at: data.created_at || new Date().toISOString(),
                                    status: 'sent'
                                }];
                            });
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

            ws.onclose = (event) => {
                setIsConnected(false);
                if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
                wsRef.current = null;
                // Exponential backoff capped at 5 seconds, retrying continuously
                const timeout = Math.min(5000, 1000 * (1.5 ** Math.min(reconnectAttempts.current, 6)));
                reconnectAttempts.current += 1;
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, timeout);
            };

            ws.onerror = () => {
                try {
                    ws.close();
                } catch (e) {
                    // ignore
                }
            };
        } catch (e) {
            console.warn("WebSocket init unavailable, using HTTP REST fallback.");
        }
    }, [partnerUserId, readOnly]);

    useEffect(() => {
        connect();
        return () => {
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect]);

    const sendMessage = useCallback(
        async (text) => {
            const trimmed = text.trim();
            if (!trimmed || trimmed.length > 2000) return false;

            const placeholderId = 'temp-' + Date.now();
            setMessages((prev) => [
                ...prev,
                { placeholderId, message: trimmed, senderId: 'me', created_at: new Date().toISOString(), status: 'sending' },
            ]);

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                try {
                    const payload = { type: 'message', receiverId: partnerUserId, message: trimmed, placeholderId, request_id: requestId };
                    wsRef.current.send(JSON.stringify(payload));
                    return true;
                } catch (err) {
                    console.warn("WS send failed, falling back to HTTP:", err);
                }
            }

            // Fallback via HTTP REST
            try {
                const res = await api.post('/chat/send', {
                    receiverId: partnerUserId,
                    message: trimmed
                });
                if (res.data?.chat) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.placeholderId === placeholderId
                                ? { ...msg, ...res.data.chat, status: 'sent', placeholderId: undefined }
                                : msg
                        )
                    );
                }
                return true;
            } catch (httpErr) {
                console.error("HTTP chat send error:", httpErr);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.placeholderId === placeholderId
                            ? { ...msg, status: 'error' }
                            : msg
                    )
                );
                return false;
            }
        },
        [partnerUserId, requestId]
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

    const acknowledgedEmergencyIdsRef = useRef(new Set());

    const acknowledgeEmergency = useCallback(async () => {
        if (emergencyAlert?.id) {
            acknowledgedEmergencyIdsRef.current.add(String(emergencyAlert.id));
        }
        if (emergencyAlert?.timestamp) {
            acknowledgedEmergencyIdsRef.current.add(String(emergencyAlert.timestamp));
        }
        setEmergencyAlert(null);

        if (partnerUserId) {
            try {
                await api.post(`/chat/emergency-partner/acknowledge?partner_id=${partnerUserId}`);
            } catch (err) {
                console.warn("Failed to acknowledge emergency via API:", err);
            }
        }
    }, [emergencyAlert, partnerUserId]);

    // Fallback HTTP sync for partner emergency & messages (works even when WS is down or returns 404)
    useEffect(() => {
        if (!partnerUserId || readOnly) return;

        let intervalId;
        const checkEmergencyAndMessages = async () => {
            try {
                const res = await api.get(`/chat/emergency-partner/check?partner_id=${partnerUserId}`);
                if (res.data?.has_emergency && res.data.emergency) {
                    const em = res.data.emergency;
                    const idKey = em.id ? String(em.id) : null;
                    const tsKey = em.timestamp ? String(em.timestamp) : null;

                    if ((!idKey || !acknowledgedEmergencyIdsRef.current.has(idKey)) &&
                        (!tsKey || !acknowledgedEmergencyIdsRef.current.has(tsKey))) {
                        setEmergencyAlert(em);
                    }
                }
            } catch (e) {
                // Ignore polling errors silently
            }

            // Periodically sync chat messages via REST to ensure no messages are lost even if WS dropped
            try {
                const chatHistory = await getChatMessages(partnerUserId, requestId, 50, 0);
                const sorted = (chatHistory?.messages || []).sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
                if (sorted.length > 0) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.chat_id).filter(Boolean));
                        const newOnes = sorted.filter((m) => !existingIds.has(m.chat_id));
                        if (newOnes.length > 0) {
                            return [...prev, ...newOnes].sort(
                                (a, b) => new Date(a.created_at) - new Date(b.created_at)
                            );
                        }
                        return prev;
                    });
                }
            } catch (e) {
                // Ignore message poll error
            }
        };

        checkEmergencyAndMessages();
        intervalId = setInterval(checkEmergencyAndMessages, 4000);
        return () => clearInterval(intervalId);
    }, [partnerUserId, requestId, readOnly]);

    const sendEmergency = useCallback(async () => {
        let sent = false;
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ type: 'emergency', receiverId: partnerUserId }));
                sent = true;
            } catch (err) {
                console.warn("WebSocket sendEmergency error:", err);
            }
        }

        // Always call HTTP fallback to guarantee delivery and notification
        try {
            await api.post(`/chat/emergency-partner?partner_id=${partnerUserId}`);
            sent = true;
        } catch (httpErr) {
            console.error("HTTP emergency-partner error:", httpErr);
        }

        return sent;
    }, [partnerUserId]);

    return { 
        messages, isTyping, partnerLocation, isConnected, isRestOnline,
        sendMessage, sendTyping, markAsRead,
        emergencyAlert, setEmergencyAlert, acknowledgeEmergency, sendEmergency
    };
};

export default useChatWebSocket;
