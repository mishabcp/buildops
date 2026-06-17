import api from './axios.js';

export async function listProjectMedia(projectId, params = {}) {
  const { data } = await api.get(`/projects/${projectId}/media`, { params });
  return data;
}

export async function uploadProjectMedia(projectId, formData) {
  const { data } = await api.post(`/projects/${projectId}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: [(body, headers) => {
      delete headers['Content-Type'];
      return body;
    }],
  });
  return data;
}

export async function deleteProjectMedia(projectId, mediaId) {
  const { data } = await api.delete(`/projects/${projectId}/media/${mediaId}`);
  return data;
}

export async function fetchProjectMediaFile(projectId, mediaId) {
  const { data } = await api.get(`/projects/${projectId}/media/${mediaId}/file`, {
    responseType: 'blob',
  });
  return data;
}

export function projectMediaFilePath(projectId, mediaId) {
  const base = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
  return `${base}/projects/${projectId}/media/${mediaId}/file`;
}
