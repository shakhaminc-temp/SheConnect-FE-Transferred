import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, MessageSquare, Clock, User as UserIcon, X, CheckCheck, MapPin } from 'lucide-react';
import { getChatHistoryOverview } from '../services/chatService';
import Chatroom from '../components/Chatroom';

const ChatHistory = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await getChatHistoryOverview();
                setHistory(data.history || []);
            } catch (err) {
                console.error("Failed to load chat history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter">She<span className="text-pink-600">Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shrink-0">
                            <MessageSquare size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Chat History</h2>
                            <p className="text-gray-500 font-medium mt-1">Review your past conversations with travel partners.</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center h-64 opacity-60">
                                <MessageSquare size={48} className="text-gray-300 mb-4" />
                                <h3 className="text-lg font-black text-gray-500">No Chat History</h3>
                                <p className="text-sm font-medium text-gray-400 mt-2">Your past conversations will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item, index) => (
                                    <div 
                                        key={index} 
                                        onClick={() => setSelectedPartner({
                                            id: item.partner_id,
                                            request_id: item.request_id,
                                            name: item.is_anonymous ? `Traveler ${item.partner_anonymous_id?.substring(0,4)}` : (item.partner_name || `Traveler ${item.partner_anonymous_id?.substring(0,4)}`),
                                            college: item.is_anonymous ? null : item.partner_college,
                                            is_anonymous: item.is_anonymous
                                        })}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-black text-xl group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                                                {(!item.is_anonymous && item.partner_name) ? item.partner_name.charAt(0) : <UserIcon size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-gray-900 group-hover:text-pink-600 transition-colors">
                                                    {item.is_anonymous ? `Traveler ${item.partner_anonymous_id?.substring(0,4)}` : (item.partner_name || `Traveler ${item.partner_anonymous_id?.substring(0,4)}`)}
                                                </h4>
                                                <p className="text-sm text-gray-500 font-medium mt-0.5 max-w-[250px] truncate">
                                                    {item.last_message}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:flex-col sm:items-end mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <Clock size={12} />
                                                {formatTime(item.last_message_time)}
                                            </div>
                                            {item.is_read ? (
                                                <div className="flex items-center gap-1 text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">
                                                    <CheckCheck size={12} /> Read
                                                </div>
                                            ) : (
                                                <div className="mt-1 px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    New
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            {/* Chat Modal */}
            {selectedPartner && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <Chatroom partner={selectedPartner} onClose={() => setSelectedPartner(null)} readOnly={true} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatHistory;
