import { useState } from "react";
import { requestPasswordReset } from "../services/auth.js";

function ForgotPasswordForm({ onShowLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Escribe tu correo para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setIsSent(true);
    } catch (requestError) {
      if (requestError.status === 422) {
        setError("Escribe un correo electrónico válido.");
      } else {
        setError("No pudimos conectar con el servidor. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-shell" aria-labelledby="forgot-title">
      <div className="login-intro">
        <div className="brand-mark" aria-hidden="true">
          B
        </div>
        <p className="eyebrow">Vuelve a entrar</p>
        <h1>Tu claridad sigue aquí.</h1>
        <p className="intro-copy">
          Te ayudaremos a recuperar el acceso de forma segura y sin complicar el
          proceso.
        </p>
      </div>

      <div className="login-card">
        {isSent ? (
          <div className="success-card-content">
            <div className="success-icon" aria-hidden="true">
              ✓
            </div>
            <p className="eyebrow">Revisa tu correo</p>
            <h2 id="forgot-title">Enlace enviado</h2>
            <p className="success-copy">
              Si la dirección está registrada, recibirás un enlace para crear una nueva
              contraseña. Expirará en 60 minutos.
            </p>
            <button className="submit-button" type="button" onClick={onShowLogin}>
              Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <div className="card-heading">
              <p className="eyebrow">Recupera tu acceso</p>
              <h2 id="forgot-title">¿Olvidaste tu contraseña?</h2>
              <p>Te enviaremos instrucciones para crear una nueva.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="forgot-email">Correo electrónico</label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
              />

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando enlace..." : "Enviar enlace"}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="form-footer">
              <button className="inline-button" type="button" onClick={onShowLogin}>
                Volver a iniciar sesión
              </button>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default ForgotPasswordForm;
