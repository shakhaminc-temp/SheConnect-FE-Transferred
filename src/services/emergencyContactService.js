import api from '../api/axios';

// Get all emergency contacts for the user
export const getContacts = async () => {
    const response = await api.get('/emergency-contacts/');
    return response.data;
};

// Add a new emergency contact
export const addContact = async (contactData) => {
    const response = await api.post('/emergency-contacts/', contactData);
    return response.data;
};

// Update an existing emergency contact
export const updateContact = async (contactId, contactData) => {
    const response = await api.put(`/emergency-contacts/${contactId}`, contactData);
    return response.data;
};

// Delete an emergency contact
export const deleteContact = async (contactId) => {
    const response = await api.delete(`/emergency-contacts/${contactId}`);
    return response.data;
};
