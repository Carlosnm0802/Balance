const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getBudget(accessToken, year, month) {
  const response = await fetch(`${API_URL}/budgets/${year}/${month}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error("No se pudo cargar el presupuesto");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function saveBudget(accessToken, year, month, amount) {
  const response = await fetch(`${API_URL}/budgets/${year}/${month}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const error = new Error("No se pudo guardar el presupuesto");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
