import api from '../api/axios';

// Request anonymous mode
export const setAnonymousMode = async (connectionId) => {
    const response = await api.post('/connect/anonymous', { connection_id: connectionId });
    return response.data;
};

// Share specific information with connection
export const shareInfo = async (connectionId, shareFlags) => {
    const response = await api.post('/connect/share-info', {
        connection_id: connectionId,
        share: shareFlags
    });
    return response.data;
};
