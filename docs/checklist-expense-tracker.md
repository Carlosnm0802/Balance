# Checklist de Proyecto de Portafolio

> Copia este archivo por cada proyecto nuevo (ej. `checklist-liga-mx-match-insights.md`) y ve llenándolo conforme avanzas. Guárdalo en tu Notion junto a tu plan semanal.

## 0. Ficha del proyecto

- **Nombre del proyecto:** Balance
- **Repo (kebab-case):** balance (por confirmar)
- **Problema que resuelve:** falta de visibilidad y control sobre los gastos personales; la gente usa notas, hojas de cálculo o memoria en vez de una herramienta especializada
- **Quién lo usaría:** estudiantes, jóvenes profesionistas y personas sin herramienta especializada para administrar sus finanzas
- **Stack a usar:** Backend Python + FastAPI, PostgreSQL, Frontend React + librería de gráficas (por definir: Recharts/Chart.js), Resend para envío de correo real, autenticación construida desde cero
- **Criterio de "terminado":** todos los módulos funcionando (auth, registrar gasto, historial, categorías, presupuesto, reportes/gráficas, perfil) + pruebas unitarias y de integración + desplegado en producción

---

## Fase 1 — Define solo, sin LLM

- [x] Escribí a mano/en doc el problema y quién lo usa
- [x] Dibujé un borrador (feo está bien) de arquitectura o flujo de pantallas
- [x] Listé las tecnologías que quiero aprender/demostrar
- [x] Definí criterios de éxito

> Nota: esta vez lo hice en conversación con el LLM en rol de entrevistador desde el inicio, en vez de traer el borrador ya hecho antes de abrir el chat. Para el próximo proyecto, intentar hacer esta fase completamente sola/o antes de involucrar al LLM.

---

## Fase 2 — LLM de planificación como auditor (no diseñador)

- [x] Usé este prompt (o similar):
  > Estoy planeando un proyecto que resuelve [X]. Ya tengo este borrador de arquitectura: [describe]. ¿Qué componentes me estoy olvidando? ¿Hay problemas de diseño que no estoy viendo?
- [x] Ajusté mi borrador con el feedback (sin dejar que el LLM rediseñe todo)

---

## Fase 3 — Desglose en tickets (30–60 min c/u)

Lista tus tickets antes de abrir el agente de código:

> Pendiente: validar este desglose fuera del chat (tamaño, orden y si falta algo) antes de pasar a la Fase 4.

| # | Ticket | ¿Hecho? |
|---|--------|---------|
| 1 | Crear repo, estructura backend (FastAPI) y frontend (React), configuración de entorno | [x] |
| 2 | Configurar PostgreSQL local + conexión desde FastAPI + primera migración vacía | [x] |
| 3 | Configurar linting/formateo básico (backend y frontend) | [x] |
| 4 | Definir modelos: Usuario, Categoría, Gasto, Presupuesto | [ ] |
| 5 | Migraciones + seed de categorías predefinidas | [ ] |
| 6 | Endpoint de registro de cuenta (hashing de contraseña) | [ ] |
| 7 | Endpoint de login (JWT/sesión — según diseño técnico) | [ ] |
| 8 | Middleware/dependencia de autenticación para proteger rutas | [ ] |
| 9 | Endpoint "olvidé mi contraseña" (token de reseteo + Resend) | [ ] |
| 10 | Endpoint de reseteo de contraseña (validar token + actualizar) | [ ] |
| 11 | UI: pantalla de login | [ ] |
| 12 | UI: pantalla de registro | [ ] |
| 13 | UI: pantalla de recuperación/reseteo de contraseña | [ ] |
| 14 | Endpoint CRUD de categorías (respetando predefinidas) | [ ] |
| 15 | UI: gestión de categorías | [ ] |
| 16 | Endpoint CRUD de gastos (flag recurrente + categoría) | [ ] |
| 17 | UI: formulario "Registrar gasto" | [ ] |
| 18 | UI: pantalla de Historial (listado + filtros) | [ ] |
| 19 | Endpoint para configurar/editar presupuesto | [ ] |
| 20 | UI: pantalla de Presupuesto | [ ] |
| 21 | Endpoint(s) de métricas agregadas (mes, categoría, comparación) | [ ] |
| 22 | UI: Dashboard con métricas | [ ] |
| 23 | UI: Reportes/Gráficas | [ ] |
| 24 | Endpoint + UI de Perfil (ver/editar cuenta, cerrar sesión) | [ ] |
| 25 | Pruebas unitarias de lógica de negocio | [ ] |
| 26 | Pruebas de integración de endpoints críticos | [ ] |
| 27 | Desplegar backend + DB | [ ] |
| 28 | Desplegar frontend + variables de entorno + prueba end-to-end en producción | [ ] |

---

## Fase 4 — Agente de código, un ticket a la vez

Repite por cada ticket:

- [ ] Pedí "implementa el ticket X" (nunca "construye el proyecto")
- [ ] Si el agente propuso tocar algo fuera del ticket, pregunté por qué antes de aceptar
- [ ] Leí el diff línea por línea (no "aceptar todo")
- [ ] Reescribí al menos una parte con mis propias palabras

---

## Fase 5 — Revisión crítica

- [ ] Usé este prompt (o similar):
  > Aquí está mi implementación de [X]: [código]. Actúa como un senior dev revisando mi PR. Dame feedback sobre seguridad, rendimiento y legibilidad, con ejemplos concretos.
- [ ] Apliqué los cambios entendiéndolos, no copiándolos a ciegas

---

## Fase 6 — Documentación

- [ ] README explica: qué hace, por qué lo construí, qué decisiones técnicas tomé
- [ ] Incluí retos encontrados y cómo los resolví
- [ ] Agregué diagrama de arquitectura o flujo de datos

---

## Fase 7 — Entrevista simulada (checkpoint final antes del CV)

- [ ] Usé este prompt (o similar):
  > Actúa como un entrevistador técnico senior. Voy a entrevistarte como si hubiera construido este proyecto: [descripción]. Hazme 5 preguntas técnicas desafiantes sobre decisiones de diseño e implementación.
- [ ] Pude responder todo sin necesidad de ver el código
- [ ] Practiqué explicar cualquier decisión de arquitectura en menos de 2 minutos
- [ ] Subido a GitHub con nombre kebab-case y agregado al CV/LinkedIn

---

## Regla de oro

**Si no lo puedes explicar en una entrevista, no lo pusiste tú.**
