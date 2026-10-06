import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, AlertCircle, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useChatWebSocket from '../hooks/useChatWebSocket';

const Chatroom = ({ partner, onClose, chatState, readOnly = false }) => {
    const { user } = useAuth();
    const partnerUserId = partner?.id || partner?.user_id; // Support different ID formats
    const requestId = partner?.request_id;

    // Use provided chatState (from live connection) or spin up a local instance (for ChatHistory)
    const fallbackChatState = useChatWebSocket(chatState ? null : partnerUserId, chatState ? null : requestId, readOnly);
    
    const activeChatState = chatState || fallbackChatState;

    const {
        messages = [],
        isTyping = false,
        isConnected = false,
        sendMessage = () => {},
        sendTyping = () => {},
        markAsRead = () => {}
    } = activeChatState;

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const observerRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // IntersectionObserver for Read Receipts
    const messageBubbleRef = useCallback((node) => {
        if (!node) return;

        // If node represents an incoming, unread message, observe it
        const isIncoming = node.dataset.senderId !== String(user?.id);
        const isUnread = node.dataset.status !== 'read';
        const chatId = node.dataset.chatId;

        if (isIncoming && isUnread && chatId) {
            if (!observerRef.current) {
                observerRef.current = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const id = entry.target.dataset.chatId;
                            if (id) {
                                markAsRead(Number(id));
                                observerRef.current.unobserve(entry.target);
                            }
                        }
                    });
                }, { threshold: 0.5 }); // 50% visible means "read"
            }
            observerRef.current.observe(node);
        }
    }, [user?.id, markAsRead]);

    // Cleanup observer
    useEffect(() => {
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        const trimmed = newMessage.trim();
        if (!trimmed || trimmed.length > 2000) return;

        const success = sendMessage(trimmed);
        if (success) {
            setNewMessage('');
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        sendTyping();
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Message Status Icon Component
    const MessageStatus = ({ status }) => {
        if (status === 'sending') return <Check size={12} className="text-pink-200" />;
        if (status === 'sent') return <Check size={12} className="text-white" />;
        if (status === 'read') return <CheckCheck size={14} className="text-blue-300" />;
        return null;
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col h-[500px] lg:h-[calc(100vh-160px)] relative overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 font-black text-lg">
                        {partner?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900">{partner?.name || 'Partner'}</h3>
                        {!readOnly && (
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    {isConnected ? 'Online' : 'Reconnecting...'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Error Banner */}
            {!isConnected && !readOnly && (
                <div className="bg-amber-50 px-4 py-2 flex items-center gap-2 text-amber-700 text-xs font-bold w-full shrink-0">
                    <AlertCircle size={14} />
                    Connection lost. Attempting to reconnect...
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fafcff]">
                {messages.length === 0 && (isConnected || readOnly) && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <Send size={24} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                            {readOnly ? "No messages in this chat" : "Start of conversation"}
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = String(msg.senderId) === String(user?.id || user?.user_id) || msg.senderId === 'me';

                    return (
                        <div
                            key={msg.chat_id || msg.placeholderId || index}
                            ref={!isMe ? messageBubbleRef : null}
                            data-chat-id={msg.chat_id}
                            data-sender-id={msg.senderId}
                            data-status={msg.status}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                            <div
                                className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm font-medium ${isMe
                                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-br-sm shadow-md'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                                    }`}
                            >
                                {msg.message || msg.text}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-1 px-1">
                                <span>{formatTime(msg.created_at)}</span>
                                {isMe && <MessageStatus status={msg.status} />}
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex flex-col items-start">
                        <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-bl-sm shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 mr-1">{partner?.name || 'Partner'} is typing</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!readOnly && (
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <form
                        onSubmit={handleSend}
                        className="flex items-end gap-2"
                    >
                        <textarea
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            disabled={!isConnected}
                            maxLength={2000}
                            placeholder={isConnected ? "Type a message..." : "Waiting for connection..."}
                            className="flex-1 max-h-32 min-h-[48px] bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !isConnected}
                            className="w-12 h-12 flex-shrink-0 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatroom;
