const API_BASE_URL = "http://localhost:8000/api";

// Helper function to handle responses
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const projectApi = {
  create: (data) =>
    fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  get: (id) =>
    fetch(`${API_BASE_URL}/projects${id ? `/${id}` : ""}`).then(handleResponse),

  getImages: (id) =>
    fetch(`${API_BASE_URL}/projects/${id}/images`).then(handleResponse),

  uploadImages: (projectId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return fetch(`${API_BASE_URL}/projects/${projectId}/images/upload`, {
      method: "POST",
      body: formData,
    }).then(handleResponse);
  },

  async detectText(projectId, imageId, engine = "easyocr") {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/images/${imageId}/detect-text?engine=${engine}`,
      {
        method: "POST",
      }
    );
    if (!response.ok) throw new Error("Failed to detect text");
    return response.json();
  },

  cleanProjectLabels: async (projectId) => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/labels`,
      {
        method: "DELETE",
      }
    );
    return response.json();
  },

  getDetails: (id) =>
    fetch(`${API_BASE_URL}/projects/${id}`).then(handleResponse),
};

export const labelApi = {
  create: (data) =>
    fetch(`${API_BASE_URL}/labels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: data.text,
        image_id: data.imageId,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
      }),
    }).then(handleResponse),

  getForImage: (imageId) =>
    fetch(`${API_BASE_URL}/labels/image/${imageId}`).then(handleResponse),

  update: (id, data) =>
    fetch(`${API_BASE_URL}/labels/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${API_BASE_URL}/labels/${id}`, {
      method: "DELETE",
    }).then(handleResponse),

  cleanImageLabels: async (imageId) => {
    const response = await fetch(`${API_BASE_URL}/labels/image/${imageId}`, {
      method: "DELETE",
    });
    return response.json();
  },
};
