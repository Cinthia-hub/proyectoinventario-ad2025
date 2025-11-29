import axios from './http'; // Tu configuración de axios existente

export const getStores = async () => {
    const response = await axios.get('/stores');
    return response.data;
};

export const createStore = async (store) => {
    const response = await axios.post('/stores', store);
    return response.data;
};

export const updateStore = async (id, store) => {
    const response = await axios.put(`/stores/${id}`, store);
    return response.data;
};

export const deleteStore = async (id) => {
    const response = await axios.delete(`/stores/${id}`);
    return response.data;
};