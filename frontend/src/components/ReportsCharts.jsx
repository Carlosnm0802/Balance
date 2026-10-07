import { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { getMetrics } from "../services/metrics.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CHART_COLORS = [
  "#1f4d37",
  "#2f6d4a",
  "#4b8c62",
  "#6aa178",
  "#88b68f",
  "#a7cba9",
  "#c6e0c3",
  "#dfefdb",
];

function ReportsCharts({ accessToken, onLogout }) {
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
          setError("No pudimos cargar los reportes. Intenta nuevamente.");
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

  const hasData = metrics && metrics.by_category.length > 0;

  const byCategoryData = useMemo(() => {
    if (!hasData) {
      return null;
    }

    return {
      labels: metrics.by_category.map((item) => item.category_name),
      datasets: [
        {
          data: metrics.by_category.map((item) => Number(item.total_amount)),
          backgroundColor: metrics.by_category.map(
            (_, index) => CHART_COLORS[index % CHART_COLORS.length],
          ),
          borderColor: "#f7faf6",
          borderWidth: 2,
        },
      ],
    };
  }, [hasData, metrics]);

  const budgetComparisonData = useMemo(() => {
    if (!metrics) {
      return null;
    }

    const budgetAmount = metrics.budget_amount ? Number(metrics.budget_amount) : 0;
    return {
      labels: ["Gasto", "Presupuesto"],
      datasets: [
        {
          label: "MXN",
          data: [Number(metrics.total_expenses), budgetAmount],
          backgroundColor: ["#a34840", "#315b3b"],
          borderRadius: 8,
        },
      ],
    };
  }, [metrics]);

  const topCategory = metrics?.by_category[0] ?? null;

  return (
    <section className="reports-card" aria-labelledby="reports-title">
      <div className="section-heading reports-heading">
        <div>
          <p className="eyebrow">Visualiza tu patrón</p>
          <h2 id="reports-title">Reportes y gráficas</h2>
        </div>
        <span className="reports-symbol" aria-hidden="true">
          ◔
        </span>
      </div>

      <div className="reports-month-picker">
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
        <p className="category-status">Cargando reportes...</p>
      ) : !metrics || !hasData ? (
        <div className="empty-categories reports-empty">
          <span className="empty-icon" aria-hidden="true">
            ∅
          </span>
          <p>Este mes no tiene gastos para graficar.</p>
          <span>Registra gastos o cambia de mes para ver reportes.</span>
        </div>
      ) : (
        <>
          <div className="reports-summary">
            <article>
              <span>Total del mes</span>
              <strong>{formatCurrency(Number(metrics.total_expenses))}</strong>
            </article>
            <article>
              <span>Categoría con mayor gasto</span>
              <strong>{topCategory?.category_name}</strong>
              <small>
                {topCategory
                  ? `${topCategory.percentage_of_total}% del total`
                  : "Sin datos"}
              </small>
            </article>
          </div>

          <div className="reports-grid">
            <article className="report-panel">
              <h3>Distribución por categoría</h3>
              <div className="chart-wrap doughnut-wrap">
                <Doughnut
                  data={byCategoryData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          boxWidth: 12,
                          color: "#385343",
                        },
                      },
                    },
                  }}
                />
              </div>
            </article>

            <article className="report-panel">
              <h3>Comparación gasto vs presupuesto</h3>
              {!metrics.budget_amount && (
                <p className="report-note">
                  Aún no tienes presupuesto para este mes; se muestra como 0.
                </p>
              )}
              <div className="chart-wrap bar-wrap">
                <Bar
                  data={budgetComparisonData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback(value) {
                            return formatCompactCurrency(Number(value));
                          },
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </article>
          </div>
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

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default ReportsCharts;
