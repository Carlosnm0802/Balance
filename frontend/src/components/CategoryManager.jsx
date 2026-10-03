import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/categories.js";

function CategoryManager({ accessToken, user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");
  const [error, setError] = useState("");

  async function loadCategories() {
    setError("");
    try {
      setCategories(await getCategories(accessToken));
    } catch (requestError) {
      if (requestError.status === 401) {
        onLogout("Tu sesión expiró. Vuelve a iniciar sesión.");
      } else {
        setError("No pudimos cargar tus categorías. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [accessToken]);

  async function handleCreate(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError("Escribe un nombre para la categoría.");
      return;
    }

    setActionKey("create");
    setError("");
    try {
      const category = await createCategory(accessToken, name);
      setCategories((current) => [...current, category]);
      setNewName("");
    } catch (requestError) {
      setError(messageForError(requestError, "crear"));
    } finally {
      setActionKey("");
    }
  }

  function startEditing(category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  async function handleUpdate(categoryId) {
    const name = editingName.trim();
    if (!name) {
      setError("Escribe un nombre para la categoría.");
      return;
    }

    setActionKey(`update-${categoryId}`);
    setError("");
    try {
      const updated = await updateCategory(accessToken, categoryId, name);
      setCategories((current) =>
        current.map((category) => (category.id === categoryId ? updated : category)),
      );
      cancelEditing();
    } catch (requestError) {
      setError(messageForError(requestError, "actualizar"));
    } finally {
      setActionKey("");
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`¿Eliminar “${category.name}”?`)) {
      return;
    }

    setActionKey(`delete-${category.id}`);
    setError("");
    try {
      await deleteCategory(accessToken, category.id);
      setCategories((current) =>
        current.filter((currentCategory) => currentCategory.id !== category.id),
      );
    } catch (requestError) {
      setError(messageForError(requestError, "eliminar"));
    } finally {
      setActionKey("");
    }
  }

  const defaultCategories = categories.filter((category) => category.is_default);
  const customCategories = categories.filter((category) => !category.is_default);

  return (
    <main className="categories-page">
      <header className="categories-header">
        <div>
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              B
            </div>
            <span>Balance</span>
          </div>
          <p className="eyebrow">Tu espacio financiero</p>
          <h1>Hola, {user.name}.</h1>
          <p className="categories-lead">
            Organiza tus gastos con nombres que tengan sentido para ti.
          </p>
        </div>
        <button className="logout-button" type="button" onClick={() => onLogout()}>
          Cerrar sesión
        </button>
      </header>

      {error && (
        <p className="category-alert" role="alert">
          {error}
        </p>
      )}

      <section className="category-section" aria-labelledby="system-categories-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Siempre disponibles</p>
            <h2 id="system-categories-title">Categorías del sistema</h2>
          </div>
          <span className="category-count">{defaultCategories.length}</span>
        </div>
        {loading ? (
          <p className="category-status">Cargando categorías...</p>
        ) : (
          <div className="category-grid">
            {defaultCategories.map((category) => (
              <div className="category-chip system-chip" key={category.id}>
                <span className="category-dot" aria-hidden="true" />
                {category.name}
                <span className="system-label">Sistema</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="category-section" aria-labelledby="custom-categories-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Hechas por ti</p>
            <h2 id="custom-categories-title">Mis categorías</h2>
          </div>
          <span className="category-count">{customCategories.length}</span>
        </div>

        <form className="category-create-form" onSubmit={handleCreate}>
          <input
            aria-label="Nombre de nueva categoría"
            type="text"
            placeholder="Ej. Mascotas, suscripciones..."
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            disabled={actionKey === "create"}
          />
          <button
            className="category-action primary"
            type="submit"
            disabled={actionKey === "create"}
          >
            {actionKey === "create" ? "Guardando..." : "+ Nueva categoría"}
          </button>
        </form>

        {loading ? null : customCategories.length === 0 ? (
          <div className="empty-categories">
            <span className="empty-icon" aria-hidden="true">
              +
            </span>
            <p>Todavía no tienes categorías personalizadas.</p>
            <span>Crea una para darle tu propio orden a Balance.</span>
          </div>
        ) : (
          <div className="custom-category-list">
            {customCategories.map((category) => {
              const isEditing = editingId === category.id;
              const isBusy =
                actionKey === `update-${category.id}` ||
                actionKey === `delete-${category.id}`;
              return (
                <div className="custom-category-row" key={category.id}>
                  {isEditing ? (
                    <input
                      aria-label={`Editar ${category.name}`}
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      disabled={isBusy}
                    />
                  ) : (
                    <div className="category-name">
                      <span className="category-dot" aria-hidden="true" />
                      {category.name}
                    </div>
                  )}
                  <div className="category-row-actions">
                    {isEditing ? (
                      <>
                        <button
                          className="category-action primary"
                          type="button"
                          onClick={() => handleUpdate(category.id)}
                          disabled={isBusy}
                        >
                          {isBusy ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          className="category-action"
                          type="button"
                          onClick={cancelEditing}
                          disabled={isBusy}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="category-action"
                          type="button"
                          onClick={() => startEditing(category)}
                          disabled={isBusy}
                        >
                          Editar
                        </button>
                        <button
                          className="category-action danger"
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={isBusy}
                        >
                          {actionKey === `delete-${category.id}`
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function messageForError(error, action) {
  if (error.status === 401) {
    return "Tu sesión expiró. Vuelve a iniciar sesión.";
  }
  if (error.status === 409) {
    return action === "eliminar"
      ? "No puedes eliminar una categoría que tiene gastos asociados."
      : "Ya existe una categoría con ese nombre.";
  }
  if (error.status === 404) {
    return "La categoría ya no está disponible.";
  }
  if (error.status === 422) {
    return "Revisa el nombre de la categoría.";
  }
  return "No pudimos conectar con el servidor. Intenta nuevamente.";
}

export default CategoryManager;
