import { useState } from "react";
import { login } from "../services/auth.js";

function LoginForm({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Escribe tu correo y contraseña para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tokenResponse = await login(email.trim(), password);
      onLogin(tokenResponse.access_token);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 422) {
        setError("El correo o la contraseña no son correctos.");
      } else {
        setError("No pudimos conectar con el servidor. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-shell" aria-labelledby="login-title">
      <div className="login-intro">
        <div className="brand-mark" aria-hidden="true">
          B
        </div>
        <p className="eyebrow">Tu dinero, más claro</p>
        <h1>Haz espacio para lo que importa.</h1>
        <p className="intro-copy">
          Balance te ayuda a entender tus gastos sin convertir tus finanzas en otra
          tarea pesada.
        </p>
        <div className="intro-note">
          <span className="note-dot" />
          <span>Seguimiento simple. Decisiones conscientes.</span>
        </div>
      </div>

      <div className="login-card">
        <div className="card-heading">
          <p className="eyebrow">Bienvenido de vuelta</p>
          <h2 id="login-title">Inicia sesión</h2>
          <p>Entra para ver cómo se mueve tu dinero.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
          />

          <div className="password-label-row">
            <label htmlFor="password">Contraseña</label>
            <button className="text-button" type="button" disabled>
              ¿La olvidaste?
            </button>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
          />

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar a Balance"}
            {!isSubmitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <p className="form-footer">
          ¿Aún no tienes una cuenta?{" "}
          <button className="inline-button" type="button" onClick={onShowRegister}>
            Crear cuenta
          </button>
        </p>
      </div>
    </section>
  );
}

export default LoginForm;
