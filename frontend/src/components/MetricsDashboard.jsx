import { useEffect, useState } from "react";
import { getMetrics } from "../services/metrics.js";

function MetricsDashboard({ accessToken, onLogout }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      setError("");
      try {
        const data = await getMetrics(accessToken, year, month);
        setMetrics(data);
      } catch (requestError) {
        if (requestError.status === 401) {
          onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
        } else {
          setError("No pudimos cargar tus métricas. Intenta nuevamente.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, [accessToken, month, onLogout, year]);

  function changeMonth(offset) {
    setSelectedDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1),
    );
  }

  const hasBudget =
    metrics?.budget_amount !== null && metrics?.budget_amount !== undefined;
  const difference = hasBudget ? Number(metrics.difference_vs_budget) : null;
  const differenceClass =
    difference === null ? "neutral" : difference > 0 ? "over-budget" : "within-budget";

  return (
    <section className="metrics-card" aria-labelledby="metrics-title">
      <div className="section-heading metrics-heading">
        <div>
          <p className="eyebrow">Vista mensual</p>
          <h2 id="metrics-title">Dashboard de métricas</h2>
        </div>
        <span className="metrics-symbol" aria-hidden="true">
          %
        </span>
      </div>

      <div className="metrics-month-picker">
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

      {isLoading ? (
        <p className="category-status">Cargando métricas...</p>
      ) : (
        <>
          <div className="metrics-grid">
            <article className="metric-item">
              <span>Total gastado</span>
              <strong>{formatCurrency(Number(metrics.total_expenses))}</strong>
            </article>

            <article className="metric-item">
              <span>Presupuesto mensual</span>
              <strong>
                {hasBudget
                  ? formatCurrency(Number(metrics.budget_amount))
                  : "Sin presupuesto"}
              </strong>
            </article>

            <article className={`metric-item ${differenceClass}`}>
              <span>Diferencia vs presupuesto</span>
              <strong>
                {hasBudget
                  ? formatSignedCurrency(difference)
                  : "Configura presupuesto para comparar"}
              </strong>
            </article>
          </div>

          <section className="metrics-breakdown" aria-label="Gasto por categoría">
            <h3>Gasto por categoría</h3>
            {metrics.by_category.length === 0 ? (
              <div className="empty-categories metrics-empty">
                <span className="empty-icon" aria-hidden="true">
                  ∅
                </span>
                <p>No hay gastos registrados en este mes.</p>
                <span>Registra gastos para ver su distribución.</span>
              </div>
            ) : (
              <div className="metrics-list">
                {metrics.by_category.map((item) => (
                  <article className="metrics-row" key={item.category_id}>
                    <div>
                      <strong>{item.category_name}</strong>
                      <p>{item.percentage_of_total}% del total</p>
                    </div>
                    <span>{formatCurrency(Number(item.total_amount))}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
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

function formatSignedCurrency(value) {
  const absValue = Math.abs(value);
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${formatCurrency(absValue)}`;
}

export default MetricsDashboard;
