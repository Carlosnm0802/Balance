const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getProfile(accessToken) {
  const response = await fetch(`${API_URL}/profile/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error("No se pudo cargar el perfil");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function updateProfile(accessToken, payload) {
  const response = await fetch(`${API_URL}/profile/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = new Error("No se pudo actualizar el perfil");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
