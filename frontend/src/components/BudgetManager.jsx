import { useEffect, useState } from "react";
import { getBudget, saveBudget } from "../services/budgets.js";

function BudgetManager({ accessToken, onLogout }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [budget, setBudget] = useState(null);
  const [amount, setAmount] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  useEffect(() => {
    async function loadBudget() {
      setIsLoading(true);
      setError("");
      setSuccess("");
      try {
        const currentBudget = await getBudget(accessToken, year, month);
        setBudget(currentBudget);
        setAmount(currentBudget.amount);
        setIsEditing(false);
      } catch (requestError) {
        if (requestError.status === 401) {
          onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
        } else if (requestError.status === 404) {
          setBudget(null);
          setAmount("");
          setIsEditing(true);
        } else {
          setError("No pudimos cargar el presupuesto. Intenta nuevamente.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadBudget();
  }, [accessToken, month, onLogout, year]);

  function changeMonth(offset) {
    setSelectedDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const numericAmount = Number(amount);
    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Escribe un importe mayor que cero.");
      return;
    }

    setIsSaving(true);
    try {
      const savedBudget = await saveBudget(
        accessToken,
        year,
        month,
        numericAmount.toFixed(2),
      );
      setBudget(savedBudget);
      setAmount(savedBudget.amount);
      setIsEditing(false);
      setSuccess("Presupuesto actualizado correctamente.");
    } catch (requestError) {
      if (requestError.status === 401) {
        onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
      } else if (requestError.status === 422) {
        setError("Escribe un importe válido mayor que cero.");
      } else {
        setError("No pudimos guardar el presupuesto. Intenta nuevamente.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="budget-card" aria-labelledby="budget-title">
      <div className="section-heading budget-heading">
        <div>
          <p className="eyebrow">Una referencia para tu mes</p>
          <h2 id="budget-title">Presupuesto mensual</h2>
        </div>
        <span className="budget-symbol" aria-hidden="true">
          $
        </span>
      </div>

      <div className="budget-month-picker">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
          ←
        </button>
        <strong>{formatMonth(selectedDate)}</strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
          →
        </button>
      </div>

      {error && (
        <p className="category-alert" role="alert">
          {error}
        </p>
      )}
      {success && <p className="expense-success">{success}</p>}

      {isLoading ? (
        <p className="category-status">Cargando presupuesto...</p>
      ) : budget && !isEditing ? (
        <div className="budget-display">
          <p>Presupuesto del mes</p>
          <strong>{formatCurrency(Number(budget.amount))}</strong>
          <button
            className="category-action primary"
            type="button"
            onClick={() => setIsEditing(true)}
          >
            Editar presupuesto
          </button>
        </div>
      ) : (
        <form className="budget-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="budget-amount">Importe mensual</label>
          <div className="amount-input-wrap">
            <span>$</span>
            <input
              id="budget-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={isSaving}
            />
            <small>MXN</small>
          </div>
          <div className="budget-form-actions">
            <button
              className="category-action primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar presupuesto"}
            </button>
            {budget && (
              <button
                className="category-action"
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

export default BudgetManager;
