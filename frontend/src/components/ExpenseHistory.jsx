import { useEffect, useMemo, useState } from "react";
import { deleteExpense, getExpenses, updateExpense } from "../services/expenses.js";
import { getCategories } from "../services/categories.js";

function ExpenseHistory({ accessToken, refreshKey, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categoryId: "",
    fromDate: "",
    toDate: "",
    recurring: "all",
  });
  const [editingId, setEditingId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExpenses() {
      setIsLoading(true);
      setError("");
      try {
        setExpenses(await getExpenses(accessToken));
      } catch (requestError) {
        if (requestError.status === 401) {
          onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
        } else {
          setError("No pudimos cargar tus gastos. Intenta nuevamente.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadExpenses();
  }, [accessToken, onLogout, refreshKey]);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await getCategories(accessToken));
      } catch (requestError) {
        if (requestError.status === 401) {
          onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
        }
      }
    }

    loadCategories();
  }, [accessToken, onLogout, refreshKey]);

  const visibleExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const matchesCategory =
          !filters.categoryId || expense.category_id === filters.categoryId;
        const matchesFrom =
          !filters.fromDate || expense.expense_date >= filters.fromDate;
        const matchesTo = !filters.toDate || expense.expense_date <= filters.toDate;
        const matchesRecurring =
          filters.recurring === "all" ||
          (filters.recurring === "recurring" && expense.is_recurring) ||
          (filters.recurring === "normal" && !expense.is_recurring);

        return matchesCategory && matchesFrom && matchesTo && matchesRecurring;
      }),
    [expenses, filters],
  );

  const visibleTotal = visibleExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function startEditing(expense) {
    setEditingId(expense.id);
    setEditingExpense({
      amount: expense.amount,
      description: expense.description || "",
      expense_date: expense.expense_date,
      category_id: expense.category_id,
      is_recurring: expense.is_recurring,
    });
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingExpense(null);
  }

  async function saveEdit(expenseId) {
    const amount = Number(editingExpense.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("El importe debe ser mayor que cero.");
      return;
    }
    if (!editingExpense.expense_date || !editingExpense.category_id) {
      setError("Revisa la fecha y la categoría.");
      return;
    }

    setActionKey(`update-${expenseId}`);
    setError("");
    try {
      const updated = await updateExpense(accessToken, expenseId, {
        amount: amount.toFixed(2),
        description: editingExpense.description.trim() || null,
        expense_date: editingExpense.expense_date,
        category_id: editingExpense.category_id,
        is_recurring: editingExpense.is_recurring,
      });
      setExpenses((current) =>
        current.map((expense) => (expense.id === expenseId ? updated : expense)),
      );
      cancelEditing();
    } catch (requestError) {
      handleRequestError(requestError, "actualizar");
    } finally {
      setActionKey("");
    }
  }

  async function removeExpense(expense) {
    if (
      !window.confirm(
        `¿Eliminar el gasto “${expense.description || "Sin descripción"}”?`,
      )
    ) {
      return;
    }

    setActionKey(`delete-${expense.id}`);
    setError("");
    try {
      await deleteExpense(accessToken, expense.id);
      setExpenses((current) =>
        current.filter((currentExpense) => currentExpense.id !== expense.id),
      );
    } catch (requestError) {
      handleRequestError(requestError, "eliminar");
    } finally {
      setActionKey("");
    }
  }

  function handleRequestError(requestError, action) {
    if (requestError.status === 401) {
      onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
    } else if (requestError.status === 404) {
      setError("El gasto o la categoría ya no están disponibles.");
    } else if (requestError.status === 422) {
      setError("Revisa los datos del gasto.");
    } else {
      setError(`No pudimos ${action} el gasto. Intenta nuevamente.`);
    }
  }

  return (
    <section className="expense-history" aria-labelledby="expense-history-title">
      <div className="section-heading history-heading">
        <div>
          <p className="eyebrow">Tu recorrido</p>
          <h2 id="expense-history-title">Historial de gastos</h2>
        </div>
        <div className="history-total">
          <small>Total visible</small>
          <strong>{formatCurrency(visibleTotal)}</strong>
        </div>
      </div>

      <div className="expense-filters">
        <select
          aria-label="Filtrar por categoría"
          value={filters.categoryId}
          onChange={(event) => updateFilter("categoryId", event.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label>
          <span>Desde</span>
          <input
            aria-label="Fecha inicial"
            type="date"
            value={filters.fromDate}
            onChange={(event) => updateFilter("fromDate", event.target.value)}
          />
        </label>
        <label>
          <span>Hasta</span>
          <input
            aria-label="Fecha final"
            type="date"
            value={filters.toDate}
            onChange={(event) => updateFilter("toDate", event.target.value)}
          />
        </label>
        <select
          aria-label="Filtrar por recurrencia"
          value={filters.recurring}
          onChange={(event) => updateFilter("recurring", event.target.value)}
        >
          <option value="all">Todos</option>
          <option value="recurring">Solo recurrentes</option>
          <option value="normal">Solo no recurrentes</option>
        </select>
      </div>

      {error && (
        <p className="category-alert" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="category-status">Cargando tus gastos...</p>
      ) : visibleExpenses.length === 0 ? (
        <div className="empty-categories expense-empty">
          <span className="empty-icon" aria-hidden="true">
            −
          </span>
          <p>
            {expenses.length === 0
              ? "Todavía no tienes gastos registrados."
              : "No hay gastos que coincidan con los filtros."}
          </p>
          <span>Registra un gasto o cambia los filtros para continuar.</span>
        </div>
      ) : (
        <div className="expense-list">
          {visibleExpenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              categories={categories}
              isEditing={editingId === expense.id}
              editingExpense={editingExpense}
              isBusy={actionKey.endsWith(expense.id)}
              onEdit={() => startEditing(expense)}
              onCancel={cancelEditing}
              onChange={setEditingExpense}
              onSave={() => saveEdit(expense.id)}
              onDelete={() => removeExpense(expense)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ExpenseRow({
  expense,
  categories,
  isEditing,
  editingExpense,
  isBusy,
  onEdit,
  onCancel,
  onChange,
  onSave,
  onDelete,
}) {
  if (isEditing) {
    return (
      <div className="expense-row expense-row-editing">
        <div className="expense-edit-grid">
          <input
            aria-label="Editar importe"
            type="number"
            min="0.01"
            step="0.01"
            value={editingExpense.amount}
            onChange={(event) =>
              onChange({ ...editingExpense, amount: event.target.value })
            }
            disabled={isBusy}
          />
          <input
            aria-label="Editar fecha"
            type="date"
            value={editingExpense.expense_date}
            onChange={(event) =>
              onChange({ ...editingExpense, expense_date: event.target.value })
            }
            disabled={isBusy}
          />
          <select
            aria-label="Editar categoría"
            value={editingExpense.category_id}
            onChange={(event) =>
              onChange({ ...editingExpense, category_id: event.target.value })
            }
            disabled={isBusy}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            aria-label="Editar descripción"
            type="text"
            value={editingExpense.description}
            onChange={(event) =>
              onChange({ ...editingExpense, description: event.target.value })
            }
            disabled={isBusy}
          />
          <label className="edit-recurring">
            <input
              type="checkbox"
              checked={editingExpense.is_recurring}
              onChange={(event) =>
                onChange({ ...editingExpense, is_recurring: event.target.checked })
              }
              disabled={isBusy}
            />
            Recurrente
          </label>
        </div>
        <div className="expense-row-actions">
          <button
            className="category-action primary"
            type="button"
            onClick={onSave}
            disabled={isBusy}
          >
            {isBusy ? "Guardando..." : "Guardar"}
          </button>
          <button
            className="category-action"
            type="button"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="expense-row">
      <div className="expense-main">
        <span className="expense-dot" aria-hidden="true" />
        <div>
          <strong>{expense.description || "Sin descripción"}</strong>
          <p>
            {expense.category_name} · {formatDate(expense.expense_date)}
            {expense.is_recurring && (
              <span className="recurring-badge">Recurrente</span>
            )}
          </p>
        </div>
      </div>
      <div className="expense-row-end">
        <strong>{formatCurrency(Number(expense.amount))}</strong>
        <div className="expense-row-actions">
          <button
            className="category-action"
            type="button"
            onClick={onEdit}
            disabled={isBusy}
          >
            Editar
          </button>
          <button
            className="category-action danger"
            type="button"
            onClick={onDelete}
            disabled={isBusy}
          >
            {isBusy ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </article>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default ExpenseHistory;
