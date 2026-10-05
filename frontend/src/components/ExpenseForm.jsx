import { useEffect, useState } from "react";
import { getCategories } from "../services/categories.js";
import { createExpense } from "../services/expenses.js";

function ExpenseForm({ accessToken, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(getToday());
  const [categoryId, setCategoryId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await getCategories(accessToken));
      } catch (requestError) {
        if (requestError.status === 401) {
          onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
        } else {
          setError("No pudimos cargar las categorías. Intenta nuevamente.");
        }
      } finally {
        setIsLoadingCategories(false);
      }
    }

    loadCategories();
  }, [accessToken, onLogout]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const numericAmount = Number(amount);
    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Escribe un importe mayor que cero.");
      return;
    }
    if (!expenseDate) {
      setError("Selecciona la fecha del gasto.");
      return;
    }
    if (!categoryId) {
      setError("Selecciona una categoría.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense(accessToken, {
        amount: numericAmount.toFixed(2),
        description: description.trim() || null,
        expense_date: expenseDate,
        is_recurring: isRecurring,
        category_id: categoryId,
      });
      setAmount("");
      setDescription("");
      setCategoryId("");
      setIsRecurring(false);
      setSuccess("Gasto registrado correctamente.");
    } catch (requestError) {
      if (requestError.status === 401) {
        onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
      } else if (requestError.status === 404) {
        setError("La categoría seleccionada ya no está disponible.");
      } else if (requestError.status === 422) {
        setError("Revisa el importe, la fecha y la categoría.");
      } else {
        setError("No pudimos registrar el gasto. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="expense-form-card" aria-labelledby="expense-form-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Nuevo movimiento</p>
          <h2 id="expense-form-title">Registrar gasto</h2>
        </div>
        <span className="expense-symbol" aria-hidden="true">
          −
        </span>
      </div>

      {error && (
        <p className="category-alert" role="alert">
          {error}
        </p>
      )}
      {success && <p className="expense-success">{success}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="expense-form-grid">
          <div>
            <label htmlFor="expense-amount">Importe</label>
            <div className="amount-input-wrap">
              <span>$</span>
              <input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={isSubmitting}
              />
              <small>MXN</small>
            </div>
          </div>

          <div>
            <label htmlFor="expense-date">Fecha</label>
            <input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <label htmlFor="expense-category">Categoría</label>
        <select
          id="expense-category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          disabled={isSubmitting || isLoadingCategories}
        >
          <option value="">
            {isLoadingCategories
              ? "Cargando categorías..."
              : "Selecciona una categoría"}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.is_default ? " · Sistema" : ""}
            </option>
          ))}
        </select>

        <label htmlFor="expense-description">
          Descripción <span>(opcional)</span>
        </label>
        <input
          id="expense-description"
          type="text"
          maxLength="500"
          placeholder="Ej. Supermercado de la semana"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
        />

        <label className="recurring-toggle" htmlFor="expense-recurring">
          <input
            id="expense-recurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(event) => setIsRecurring(event.target.checked)}
            disabled={isSubmitting}
          />
          <span className="toggle-box" aria-hidden="true" />
          <span>
            <strong>Marcar como recurrente</strong>
            <small>Lo identificaremos así en tus registros.</small>
          </span>
        </label>

        <button
          className="submit-button expense-submit"
          type="submit"
          disabled={isSubmitting || isLoadingCategories}
        >
          {isSubmitting ? "Guardando gasto..." : "Guardar gasto"}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      </form>
    </section>
  );
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default ExpenseForm;
