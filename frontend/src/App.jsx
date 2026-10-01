import { useState } from "react";
import LoginForm from "./components/LoginForm.jsx";
import { getCurrentUser } from "./services/auth.js";
import "./styles/app.css";

function App() {
  const [session, setSession] = useState(null);

  async function handleLogin(accessToken) {
    const user = await getCurrentUser(accessToken);
    setSession({ accessToken, user });
  }

  if (session) {
    return (
      <main className="app-page">
        <div className="success-card">
          <div className="success-icon" aria-hidden="true">
            ✓
          </div>
          <p className="eyebrow">Sesión activa</p>
          <h1>Hola, {session.user.name}.</h1>
          <p>Tu espacio de Balance está listo para empezar.</p>
          <button
            className="submit-button"
            type="button"
            onClick={() => setSession(null)}
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <LoginForm onLogin={handleLogin} />
    </main>
  );
}

export default App;
