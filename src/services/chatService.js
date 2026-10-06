// src/services/chatService.js
import api from '../api/axios';

/**
 * Fetch chat messages with a specific partner
 * @param {number} partnerId - User ID of chat partner
 * @param {number} requestId - (Optional) ID of the ride request
 * @param {number} limit - Number of messages to fetch
 * @param {number} offset - Pagination offset
 * @returns {Promise<Object>} - Messages data
 */
export const getChatMessages = async (partnerId, requestId = null, limit = 50, offset = 0) => {
    try {
        let url = `/chat/${partnerId}?limit=${limit}&offset=${offset}`;
        if (requestId) {
            url += `&request_id=${requestId}`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch chat messages:', error);
        return { messages: [] };
    }
};

/**
 * Fetch chat history overview (list of past chat partners)
 * @returns {Promise<Object>} - Chat history data
 */
export const getChatHistoryOverview = async () => {
    try {
        const response = await api.get('/chat/history');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch chat history:', error);
        return { history: [] };
    }
};
