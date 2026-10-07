import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/profile.js";

function ProfilePanel({ accessToken, user, onUserUpdated, onLogout }) {
  const [profile, setProfile] = useState(user);
  const [name, setName] = useState(user?.name ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError("");
      try {
        const currentProfile = await getProfile(accessToken);
        setProfile(currentProfile);
        setName(currentProfile.name);
      } catch (requestError) {
        if (requestError.status === 401) {
          onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
        } else {
          setError("No pudimos cargar tu perfil. Intenta nuevamente.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [accessToken, onLogout]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await updateProfile(accessToken, {
        name: normalizedName,
      });
      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setSuccess("Perfil actualizado correctamente.");
      onUserUpdated(updatedProfile);
    } catch (requestError) {
      if (requestError.status === 401) {
        onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
      } else if (requestError.status === 422) {
        setError("Revisa el nombre e intenta nuevamente.");
      } else {
        setError("No pudimos actualizar tu perfil. Intenta nuevamente.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="profile-card" aria-labelledby="profile-title">
      <div className="section-heading profile-heading">
        <div>
          <p className="eyebrow">Tu cuenta</p>
          <h2 id="profile-title">Perfil</h2>
        </div>
        <span className="profile-symbol" aria-hidden="true">
          👤
        </span>
      </div>

      {error && (
        <p className="category-alert" role="alert">
          {error}
        </p>
      )}
      {success && <p className="expense-success">{success}</p>}

      {isLoading ? (
        <p className="category-status">Cargando perfil...</p>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="profile-name">Nombre</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSaving}
          />

          <label htmlFor="profile-email">Correo</label>
          <input
            id="profile-email"
            type="email"
            value={profile?.email ?? ""}
            disabled
            readOnly
          />

          <div className="profile-actions">
            <button
              className="category-action primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              className="category-action"
              type="button"
              onClick={() => {
                setName(profile?.name ?? "");
                setError("");
                setSuccess("");
              }}
              disabled={isSaving}
            >
              Restablecer
            </button>
            <button className="logout-button" type="button" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default ProfilePanel;
