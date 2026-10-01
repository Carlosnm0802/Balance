import { useState } from "react";
import { register } from "../services/auth.js";

function RegisterForm({ onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Completa todos los campos para continuar.");
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
      await register(name.trim(), email.trim(), password);
      setIsRegistered(true);
    } catch (requestError) {
      if (requestError.status === 409) {
        setError("Este correo ya está registrado. Intenta iniciar sesión.");
      } else if (requestError.status === 422) {
        setError("Revisa los datos ingresados.");
      } else {
        setError("No pudimos conectar con el servidor. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isRegistered) {
    return (
      <section className="login-shell" aria-labelledby="register-success-title">
        <div className="login-intro">
          <div className="brand-mark" aria-hidden="true">
            B
          </div>
          <p className="eyebrow">Un buen comienzo</p>
          <h1>Tu claridad empieza aquí.</h1>
          <p className="intro-copy">
            Ya tienes un espacio para observar tus gastos con calma y tomar mejores
            decisiones.
          </p>
        </div>
        <div className="login-card success-card-content">
          <div className="success-icon" aria-hidden="true">
            ✓
          </div>
          <p className="eyebrow">Cuenta creada</p>
          <h2 id="register-success-title">Todo listo.</h2>
          <p className="success-copy">
            Tu cuenta fue creada correctamente. Ahora inicia sesión para entrar a
            Balance.
          </p>
          <button className="submit-button" type="button" onClick={onShowLogin}>
            Ir a iniciar sesión
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="login-shell" aria-labelledby="register-title">
      <div className="login-intro">
        <div className="brand-mark" aria-hidden="true">
          B
        </div>
        <p className="eyebrow">Empieza con claridad</p>
        <h1>Tu dinero merece un lugar claro.</h1>
        <p className="intro-copy">
          Crea tu cuenta y comienza a construir una relación más consciente con tus
          gastos.
        </p>
        <div className="intro-note">
          <span className="note-dot" />
          <span>Simple desde el primer día.</span>
        </div>
      </div>

      <div className="login-card register-card">
        <div className="card-heading">
          <p className="eyebrow">Nuevo por aquí</p>
          <h2 id="register-title">Crea tu cuenta</h2>
          <p>Solo necesitas unos datos para comenzar.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="register-name">Nombre completo</label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
          />

          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
          />

          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
          />

          <label htmlFor="register-confirm-password">Confirmar contraseña</label>
          <input
            id="register-confirm-password"
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
            {isSubmitting ? "Creando cuenta..." : "Crear mi cuenta"}
            {!isSubmitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <p className="form-footer">
          ¿Ya tienes una cuenta?{" "}
          <button className="inline-button" type="button" onClick={onShowLogin}>
            Inicia sesión
          </button>
        </p>
      </div>
    </section>
  );
}

export default RegisterForm;
