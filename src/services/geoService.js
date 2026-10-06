import api from '../api/axios';

// Fetch location suggestions using backend proxy (Photon/Komoot)
export const autocomplete = async (query) => {
    if (!query || query.length < 3) return { results: [] };
    const response = await api.get(`/api/geo/autocomplete?q=${encodeURIComponent(query)}`);
    return response.data;
};
