import axios from './http';

export const getSettings = async () => {
  const response = await axios.get('/settings');
  return response.data;
};

export const saveSettings = async (data) => {
  const response = await axios.post('/settings', data);
  return response.data;
};