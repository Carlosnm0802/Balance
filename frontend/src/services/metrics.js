const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getMetrics(accessToken, year, month) {
  const response = await fetch(`${API_URL}/metrics/${year}/${month}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error("No se pudieron cargar las métricas");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
