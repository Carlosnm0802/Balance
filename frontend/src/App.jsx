import { useState } from "react";
import CategoryManager from "./components/CategoryManager.jsx";
import BudgetManager from "./components/BudgetManager.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseHistory from "./components/ExpenseHistory.jsx";
import ForgotPasswordForm from "./components/ForgotPasswordForm.jsx";
import LoginForm from "./components/LoginForm.jsx";
import MetricsDashboard from "./components/MetricsDashboard.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import ResetPasswordForm from "./components/ResetPasswordForm.jsx";
import { getCurrentUser } from "./services/auth.js";
import "./styles/app.css";

function App() {
  const [session, setSession] = useState(null);
  const [expensesRefreshKey, setExpensesRefreshKey] = useState(0);
  const resetToken = new URLSearchParams(window.location.search).get("token");
  const initialView =
    window.location.pathname === "/reset-password" ? "reset-password" : "login";
  const [authView, setAuthView] = useState(initialView);

  async function handleLogin(accessToken) {
    const user = await getCurrentUser(accessToken);
    setSession({ accessToken, user });
  }

  if (session) {
    return (
      <main className="authenticated-page">
        <CategoryManager
          accessToken={session.accessToken}
          user={session.user}
          onLogout={() => setSession(null)}
        />
        <ExpenseForm
          accessToken={session.accessToken}
          onLogout={() => setSession(null)}
          onCreated={() => setExpensesRefreshKey((value) => value + 1)}
        />
        <ExpenseHistory
          accessToken={session.accessToken}
          refreshKey={expensesRefreshKey}
          onLogout={() => setSession(null)}
        />
        <MetricsDashboard
          accessToken={session.accessToken}
          onLogout={() => setSession(null)}
        />
        <BudgetManager
          accessToken={session.accessToken}
          onLogout={() => setSession(null)}
        />
      </main>
    );
  }

  return (
    <main className="app-page">
      {authView === "login" && (
        <LoginForm
          onLogin={handleLogin}
          onShowForgotPassword={() => setAuthView("forgot-password")}
          onShowRegister={() => setAuthView("register")}
        />
      )}
      {authView === "register" && (
        <RegisterForm onShowLogin={() => setAuthView("login")} />
      )}
      {authView === "forgot-password" && (
        <ForgotPasswordForm onShowLogin={() => setAuthView("login")} />
      )}
      {authView === "reset-password" && (
        <ResetPasswordForm
          token={resetToken}
          onShowLogin={() => {
            window.history.replaceState({}, "", "/");
            setAuthView("login");
          }}
        />
      )}
    </main>
  );
}

export default App;
