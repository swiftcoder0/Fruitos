// frontend/lib/api.ts
import axios from 'axios';
import { DecisionResponse } from '@/types/decision';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const cropsApi = {
  create: (data: any) => api.post('/crops/', data).then(res => res.data),
  get: (id: number) => api.get(`/crops/${id}`).then(res => res.data),
};

export const batchesApi = {
  create: (data: any) => api.post('/batches/', data).then(res => res.data),
  get: (id: string) => api.get(`/batches/${id}`).then(res => res.data),
};

export const marketsApi = {
  get: (quantityKg: number) =>
    api.get(`/markets/?quantity_kg=${quantityKg}`).then(res => res.data),
};

export const transportApi = {
  get: (quantityKg: number, destination: string) =>
    api.get(`/transport/options?quantity_kg=${quantityKg}&destination=${destination}`).then(res => res.data),
};

export const eventsApi = {
  logTemperature: (batchId: number, temp: number, location: string) =>
    api.post(`/events/temperature?batch_id=${batchId}&temperature_c=${temp}&location=${location}`).then(res => res.data),
  logLocation: (batchId: number, location: string, description: string) =>
    api.post(`/events/location?batch_id=${batchId}&location=${location}&description=${description}`).then(res => res.data),
  getTimeline: (batchId: number) => api.get(`/events/batch/${batchId}`).then(res => res.data),
};

export const qualityApi = {
  inspect: (batchId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    return api.post(`/quality/inspect?batch_id=${batchId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
};

export const decisionsApi = {
  get: (id: number | string): Promise<DecisionResponse> =>
    api.get(`/decisions/${id}`).then(res => res.data),
};

export default api;