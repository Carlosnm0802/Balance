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

async function requestExpense(path, accessToken, options = {}) {
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

  return response.status === 204 ? null : response.json();
}

export function getExpenses(accessToken) {
  return requestExpense("/expenses", accessToken);
}

export function updateExpense(accessToken, expenseId, expense) {
  return requestExpense(`/expenses/${expenseId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(expense),
  });
}

export function deleteExpense(accessToken, expenseId) {
  return requestExpense(`/expenses/${expenseId}`, accessToken, {
    method: "DELETE",
  });
}
