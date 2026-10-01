const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = new Error("No se pudo iniciar sesión");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function register(name, email, password) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = new Error("No se pudo crear la cuenta");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar la sesión");
  }

  return response.json();
}

export async function requestPasswordReset(email) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = new Error("No se pudo solicitar la recuperación");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function resetPassword(token, newPassword) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!response.ok) {
    const error = new Error("No se pudo actualizar la contraseña");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
