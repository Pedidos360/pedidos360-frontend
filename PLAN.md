# Plan de desarrollo en paralelo — Pedidos360

Checklist de trabajo para avanzar en pareja sin bloquearse. Basado en el SDD v1.0.
Marca cada ítem cuando esté hecho y mergeado a `main` (con PR revisado por el otro integrante).

Leyenda: 🅰️ Persona A (frontend) · 🅱️ Persona B (backend) · 🤝 Ambos

---

## Paso 0 — Prerrequisito compartido (bloqueante) 🤝

Hacer esto **juntos, antes de dividirse**, porque ambos flujos dependen de esto.

- [x] Registrar la app en Azure AD (Entra ID) — `Pedidos360-SPA`, tenant propio (cuenta personal, sin tenant institucional por falta de permisos de admin)
- [x] Definir **App Roles** en el manifiesto: `Admin`, `Operador`, `Cliente`
- [x] Asignar al menos un usuario de prueba a cada rol (Enterprise Applications → Users and groups)
- [x] Configurar Redirect URI tipo SPA (`http://localhost:5173`) con Authorization Code + PKCE
- [x] Anotar `tenantId`, `clientId`, `authority`, `redirectUri` en un lugar compartido **fuera del repo**
- [ ] Cada integrante crea su propio `.env` local (ignorado por git) con esos valores — pendiente hasta que exista el proyecto (Fase 1)
- [x] Verificar manualmente: id_token vía [jwt.ms](https://jwt.ms) y confirmar que el claim `roles` aparece con el rol asignado (`"roles": ["Admin"]` confirmado)

**Paso 0 completo ✅** — queda pendiente únicamente crear el `.env` local de cada integrante, lo cual se hace naturalmente al arrancar la Fase 1.

**Sin esto, ninguno de los dos flujos de abajo puede completarse de verdad** (frontend no puede leer rol, backend no puede validar rol) — pero ambos pueden avanzar en paralelo con la estructura/base mientras se termina de configurar.

---

## Paso 1 — Streams en paralelo

### 🅰️ Frontend (`pedidos360-frontend`) — Fases 1-4 del SDD
- [x] Fase 1: Proyecto React + Vite, base visual sin auth
- [x] Fase 2: Integrar MSAL (`@azure/msal-browser`, `@azure/msal-react`), login/logout funcional (Client/Tenant vía variables de entorno)
- [x] Fase 3: Rutas protegidas + lectura de rol desde `idTokenClaims` (`ProtectedRoute`, `RoleGuard`, `Navbar`, router)
- [ ] Fase 4: Cliente HTTP (axios) con interceptor que adjunta JWT automáticamente

### 🅱️ Backend (`pedidos360-backend`) — Fases 5-7 del SDD
- [ ] Fase 5: Estructura base de `ms-pedidos`, `ms-productos`, `ms-usuarios` (controller/service/repository/entity + conexión BD vía variables de entorno)
- [ ] Fase 6: Filtro de validación de JWT (issuer, audience, firma, vigencia) + `@PreAuthorize` por rol
- [ ] Fase 7: Pruebas unitarias/integración por microservicio (con y sin token válido)

> Mientras el Paso 0 no esté 100% cerrado, 🅰️ puede avanzar mockeando respuestas de API y 🅱️ puede probar sus endpoints con Postman/curl y un token de prueba.

---

## Paso 2 — Convergencia 🤝

- [ ] Fase 8: Dockerizar cada microservicio + `docker-compose.yml` en el backend
- [ ] Fase 9: Probar todo localmente (frontend real → backend real vía Docker Compose)
- [ ] Fase 10: Levantar instancia(s) EC2 y desplegar contenedores
- [ ] Fase 11: Configurar AWS API Gateway apuntando a EC2
- [ ] Fase 12: Prueba end-to-end (login → rol → llamada → gateway → microservicio → respuesta)
- [ ] Fase 13: Revisión final de `.gitignore`, README y limpieza de ambos repos
- [ ] Fase 14: Entrega — enlaces a AVA + correo al docente

---

## Reglas de flujo (recordatorio del SDD, sección 5.2)

- Ramas por funcionalidad (`feature/login-msal`, `feature/ms-pedidos`, etc.)
- Commits pequeños y descriptivos
- PR hacia `main` antes de integrar — el otro integrante revisa, aunque el repo no sea "el suyo"
- `main` siempre en estado funcional (compila, sin errores)
- Sync corto en cada sesión de trabajo: qué se hizo, qué bloquea, qué sigue
