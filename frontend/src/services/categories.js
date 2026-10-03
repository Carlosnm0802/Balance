const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, accessToken, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = new Error("No se pudo completar la operación");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getCategories(accessToken) {
  return request("/categories", accessToken);
}

export function createCategory(accessToken, name) {
  return request("/categories", accessToken, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateCategory(accessToken, categoryId, name) {
  return request(`/categories/${categoryId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(accessToken, categoryId) {
  return request(`/categories/${categoryId}`, accessToken, {
    method: "DELETE",
  });
}
