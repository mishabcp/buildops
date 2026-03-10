import api from './axios.js';

export async function getBills(params = {}) {
  const { data } = await api.get('/bills', { params });
  return data;
}

export async function getBill(id) {
  const { data } = await api.get(`/bills/${id}`);
  return data;
}

export async function createBill(body) {
  const { data } = await api.post('/bills', body);
  return data;
}

export async function updateBill(id, body) {
  const { data } = await api.put(`/bills/${id}`, body);
  return data;
}

export async function addBillPayment(billId, body) {
  const { data } = await api.post(`/bills/${billId}/payments`, body);
  return data;
}
