# Software Design Document (SDD) — Sistema Pedidos360

**Ramo:** DSY1107 — Desarrollo Cloud Native I
**Evaluación:** Evaluación Parcial N°1 (Encargo, en parejas)
**Versión del documento:** 1.0

---

## 1. Introducción

### 1.1 Propósito
Este documento describe el diseño técnico del sistema **Pedidos360**: la arquitectura, los componentes, el modelo de seguridad y el plan de trabajo para construirlo de forma incremental, incluyendo el uso de GitHub como medio de entrega y control de versiones.

### 1.2 Objetivo del sistema
Diseñar y desarrollar la arquitectura base de Pedidos360, integrando:
- Login corporativo con **Azure AD (IDaaS)**.
- Frontend en **React** con **MSAL** y autorización por rol (**Admin, Operador, Cliente**).
- Backend en **Spring Boot** con microservicios, protegidos detrás de **AWS API Gateway** mediante el JWT emitido por Azure AD.
- Despliegue en **AWS EC2** usando **Docker / Docker-Compose**.

### 1.3 Nota sobre el framework de frontend
La pauta original de la evaluación especifica Angular. Este SDD documenta la decisión tomada de implementar el frontend en **React**, manteniendo equivalentes funcionales a cada elemento pedido (guard → rutas protegidas, MsalInterceptor → cliente HTTP con token adjunto).

---

## 2. Arquitectura general

```
                     ┌──────────────────────────┐
                     │   Microsoft Entra ID      │
                     │   (Azure AD / IDaaS)      │
                     └────────────┬──────────────┘
                                  │ login / JWT
                                  ▼
                     ┌──────────────────────────┐
                     │  Frontend (React + MSAL) │
                     │  Roles: Admin/Operador/  │
                     │         Cliente          │
                     └────────────┬──────────────┘
                                  │ HTTPS + JWT (Authorization: Bearer)
                                  ▼
                     ┌──────────────────────────┐
                     │   AWS API Gateway         │
                     │  (valida JWT / enruta)    │
                     └────────────┬──────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
     │ MS Pedidos      │ │ MS Productos    │ │ MS Usuarios     │
     │ (Spring Boot)   │ │ (Spring Boot)   │ │ (Spring Boot)   │
     │ Docker container│ │ Docker container│ │ Docker container│
     └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
              └───────────────────┼───────────────────┘
                                  ▼
                     ┌──────────────────────────┐
                     │   Base de datos cloud     │
                     └──────────────────────────┘

   Todo lo anterior corre sobre instancias AWS EC2, orquestado con Docker Compose.
```

### 2.1 Flujo de autenticación y autorización
1. El usuario inicia sesión en el frontend vía `loginRedirect()` (MSAL) contra Azure AD.
2. Azure AD devuelve un JWT que incluye, entre otros claims, el **rol** del usuario.
3. El frontend usa ese rol para mostrar/ocultar vistas y bloquear acciones (Admin, Operador, Cliente).
4. Cada llamada HTTP al backend adjunta el JWT en el header `Authorization: Bearer <token>`.
5. AWS API Gateway (y/o un filtro BFF en el backend) valida: firma, `issuer`, `audience`, vigencia y rol.
6. Si el token es válido y el rol tiene permiso, la petición se enruta al microservicio correspondiente.
7. Si no, se responde con un código de error adecuado (401/403).

---

## 3. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite |
| Autenticación frontend | `@azure/msal-browser`, `@azure/msal-react` |
| Backend | Java + Spring Boot (varios microservicios) |
| Validación JWT backend | Spring Security + biblioteca de validación JWT (ej. `spring-boot-starter-oauth2-resource-server`) |
| Gateway | AWS API Gateway |
| Cómputo | AWS EC2 |
| Contenerización | Docker / Docker Compose |
| Identidad | Microsoft Entra ID (Azure AD) |
| Control de versiones | GitHub (2 repositorios: frontend y backend) |

---

## 4. Componentes del sistema

### 4.1 Frontend (React + MSAL)
- `authConfig.ts`: configuración de MSAL (clientId, authority, redirectUri, cacheLocation).
- `main.tsx`: `PublicClientApplication` + `MsalProvider` envolviendo la app.
- Rutas protegidas: componente wrapper que usa `AuthenticatedTemplate` / verifica sesión antes de renderizar rutas privadas (equivalente al `MsalGuard` de Angular).
- Lectura de rol: extraer el claim de rol desde `accounts[0].idTokenClaims` para condicionar la UI (menús, botones, rutas visibles según Admin/Operador/Cliente).
- Cliente HTTP centralizado (ej. instancia de `axios` con interceptor) que:
  - Obtiene el token silenciosamente con `instance.acquireTokenSilent(...)`.
  - Lo adjunta como header `Authorization` en cada request.
  - Redirige a login si el token expiró y no se pudo renovar.

### 4.2 Backend — Microservicios Spring Boot
Sugerencia de división por dominio:
- **ms-pedidos**: gestión de pedidos (crear, listar, actualizar estado).
- **ms-productos**: catálogo de productos.
- **ms-usuarios**: datos de usuario/perfil (complementario al usuario de Azure AD).

Cada microservicio debe tener:
- Capas `controller` / `service` / `repository` / `entity`.
- Configuración de conexión a base de datos (`application.yml` con variables de entorno, sin credenciales hardcodeadas).
- Pruebas básicas (unitarias y/o de integración).
- Un filtro de seguridad que valide el JWT recibido (o delegar en el BFF/API Gateway según el diseño final del equipo).

### 4.3 BFF / validación de JWT
- Verifica **firma** del token contra las claves públicas de Azure AD (JWKS).
- Verifica **issuer** y **audience** coincidan con el tenant/app registrada.
- Verifica **vigencia** (`exp`, `nbf`).
- Extrae el **rol** del token y aplica autorización (ej. con `@PreAuthorize` en Spring Security).
- Responde con `401 Unauthorized` si el token es inválido, `403 Forbidden` si el rol no tiene permiso.

### 4.4 AWS API Gateway
- Punto de entrada único hacia los microservicios.
- Enruta cada path (`/pedidos/**`, `/productos/**`, `/usuarios/**`) a su microservicio correspondiente.
- Puede incorporar un *authorizer* (Lambda authorizer o JWT authorizer nativo) para validar el token antes de reenviar la petición.

### 4.5 AWS EC2 + Docker
- Cada microservicio se empaqueta en su propio `Dockerfile`.
- `docker-compose.yml` a nivel de backend levanta todos los microservicios (y la base de datos, si es local) con un solo comando.
- Las instancias EC2 ejecutan Docker/Docker Compose para correr los contenedores en la nube.

---

## 5. Estructura de repositorios GitHub

Se manejan **dos repositorios independientes**, según lo exige la pauta:

```
pedidos360-frontend/          pedidos360-backend/
├── src/                      ├── ms-pedidos/
├── package.json              ├── ms-productos/
├── .gitignore                ├── ms-usuarios/
└── README.md                 ├── docker-compose.yml
                               ├── .gitignore
                               └── README.md
```

### 5.1 `.gitignore` mínimo por contexto

**Frontend (`pedidos360-frontend/.gitignore`):**
```
node_modules/
dist/
.env
```

**Backend (`pedidos360-backend/.gitignore`):**
```
target/
*.class
.env
.idea/
*.iml
```

### 5.2 Flujo de trabajo en GitHub (por pareja)
1. Cada integrante clona el repositorio correspondiente.
2. Se trabaja en ramas por funcionalidad: `feature/login-msal`, `feature/ms-pedidos`, `feature/jwt-validation`, etc.
3. Commits pequeños y descriptivos (ej. `feat: agrega interceptor de token en cliente HTTP`).
4. Pull Request hacia `main` antes de integrar cada funcionalidad — permite que ambos integrantes revisen el código del otro.
5. `main` debe quedar siempre en estado funcional (compilando, sin errores).
6. Al final, copiar los enlaces de ambos repositorios en AVA y enviarlos por correo al docente, dentro del plazo.

---

## 6. Plan de desarrollo paso a paso

| Fase | Tarea | Repositorio / rama sugerida |
|---|---|---|
| 1 | Crear proyecto React + Vite, base visual sin auth | `pedidos360-frontend` → `main` |
| 2 | Registrar app en Azure AD (o reutilizar), instalar e integrar MSAL (login/logout) | `feature/login-msal` |
| 3 | Agregar rutas protegidas + lectura de rol desde el token | `feature/roles-frontend` |
| 4 | Crear cliente HTTP con adjunción automática de JWT | `feature/http-client-jwt` |
| 5 | Crear los microservicios Spring Boot base (estructura, entidades, repos, conexión a BD) | `pedidos360-backend` → `feature/ms-base` |
| 6 | Implementar validación de JWT (filtro/BFF) y autorización por rol en el backend | `feature/jwt-validation` |
| 7 | Escribir pruebas básicas de cada microservicio | `feature/tests` |
| 8 | Dockerizar cada microservicio y crear `docker-compose.yml` | `feature/docker` |
| 9 | Probar todo localmente con Docker Compose (frontend apuntando a backend local) | — |
| 10 | Configurar instancias EC2 y desplegar los contenedores | `feature/deploy-ec2` |
| 11 | Configurar AWS API Gateway apuntando a las instancias EC2 | `feature/api-gateway` |
| 12 | Prueba end-to-end completa (login → rol → llamada → gateway → microservicio → respuesta) | — |
| 13 | Revisión final de `.gitignore`, README y limpieza de ambos repos | — |
| 14 | Entrega: copiar enlaces a AVA + correo al docente | — |

---

## 7. Plan de pruebas

- **Frontend**: verificar login/logout, redirección según rol, manejo de token expirado.
- **Backend**: pruebas unitarias por servicio (lógica de negocio) y pruebas de integración para los endpoints protegidos (con y sin token válido).
- **Seguridad**: probar explícitamente casos de token inválido, token expirado, rol sin permiso — deben responder con el código HTTP correcto.
- **Despliegue**: verificar que el flujo funciona igual en local (Docker Compose) y en AWS (EC2 + API Gateway).

---

## 8. Mapeo con la pauta de evaluación

| Indicador de la pauta | Dónde se cubre en este SDD |
|---|---|
| MSAL integrado y operativo, guards/interceptor, tokens para consumir API Gateway | Sección 4.1 (Frontend) |
| BFF valida issuer/audience/firma/vigencia y aplica autorización por rol | Sección 4.3 (BFF / validación JWT) |
| Backend compila, buenas prácticas, pruebas básicas | Secciones 4.2 y 7 |
| Integración con base de datos cloud (entidades, repos, conexión) | Sección 4.2 |
| `.gitignore` correcto por tecnología | Sección 5.1 |
| Entrega como enlaces a GitHub | Sección 5 y Fase 14 |

---

## 9. Riesgos y consideraciones

- **Framework distinto al pedido (React vs. Angular):** documentar claramente en el README de cada repo que se optó por React, para que el docente entienda la decisión desde el inicio.
- **Credenciales de Azure AD**: no subir Client Secrets al repositorio (esta demo no los necesita, ya que es una SPA con Authorization Code Flow + PKCE).
- **Costos AWS**: monitorear el uso de EC2 y API Gateway para no exceder créditos/free tier.
- **Coordinación en pareja**: usar ramas y Pull Requests para evitar sobrescribir trabajo del compañero/a.
