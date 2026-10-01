import { useState } from "react";
import { resetPassword } from "../services/auth.js";

function ResetPasswordForm({ token, onShowLogin }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Completa ambos campos para continuar.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("La contraseña debe tener entre 8 y 128 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      window.history.replaceState({}, "", "/");
      setIsUpdated(true);
    } catch (requestError) {
      if (requestError.status === 400 || requestError.status === 422) {
        setError("Este enlace no es válido o ya expiró.");
      } else {
        setError("No pudimos conectar con el servidor. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <section className="login-shell" aria-labelledby="reset-title">
        <div className="login-intro">
          <div className="brand-mark" aria-hidden="true">
            B
          </div>
          <p className="eyebrow">Enlace de recuperación</p>
          <h1>Algo no coincide.</h1>
          <p className="intro-copy">
            Necesitamos un enlace válido para ayudarte a recuperar tu cuenta.
          </p>
        </div>
        <div className="login-card success-card-content">
          <p className="eyebrow">Enlace inválido</p>
          <h2 id="reset-title">No encontramos un token.</h2>
          <p className="success-copy">
            Solicita un nuevo enlace de recuperación para continuar.
          </p>
          <button className="submit-button" type="button" onClick={onShowLogin}>
            Ir a iniciar sesión
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="login-shell" aria-labelledby="reset-title">
      <div className="login-intro">
        <div className="brand-mark" aria-hidden="true">
          B
        </div>
        <p className="eyebrow">Un nuevo comienzo</p>
        <h1>Vuelve a sentir el control.</h1>
        <p className="intro-copy">
          Elige una contraseña segura para proteger tu espacio en Balance.
        </p>
      </div>

      <div className="login-card">
        {isUpdated ? (
          <div className="success-card-content">
            <div className="success-icon" aria-hidden="true">
              ✓
            </div>
            <p className="eyebrow">Contraseña actualizada</p>
            <h2 id="reset-title">Ya puedes entrar.</h2>
            <p className="success-copy">
              Tu contraseña se actualizó correctamente. Inicia sesión para continuar.
            </p>
            <button className="submit-button" type="button" onClick={onShowLogin}>
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <div className="card-heading">
              <p className="eyebrow">Cambia tu contraseña</p>
              <h2 id="reset-title">Crea una nueva</h2>
              <p>Usa al menos 8 caracteres para mantener tu cuenta segura.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="reset-password">Nueva contraseña</label>
              <input
                id="reset-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />

              <label htmlFor="reset-confirm-password">Confirmar contraseña</label>
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSubmitting}
              />

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

export default ResetPasswordForm;
