import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

export const projectApi = {
  create: (data) => axios.post(`${API_BASE_URL}/projects`, data),
  get: (id) => axios.get(`${API_BASE_URL}/projects/${id}`),
  getImages: (id) => axios.get(`${API_BASE_URL}/projects/${id}/images`),
  uploadImages: (projectId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return axios.post(
      `${API_BASE_URL}/projects/${projectId}/images/upload`,
      formData
    );
  },
};

export const labelApi = {
  create: (data) => axios.post(`${API_BASE_URL}/labels`, data),
  getForImage: (imageId) =>
    axios.get(`${API_BASE_URL}/labels/image/${imageId}`),
  update: (id, data) => axios.put(`${API_BASE_URL}/labels/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/labels/${id}`),
};
