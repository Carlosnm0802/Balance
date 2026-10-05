const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function createExpense(accessToken, expense) {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    const error = new Error("No se pudo registrar el gasto");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
