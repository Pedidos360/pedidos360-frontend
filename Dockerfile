# --- Etapa 1: build de la SPA (SDD §7) ---
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependencias primero para aprovechar la caché de capas.
COPY package.json package-lock.json ./
RUN npm ci

# Las variables VITE_* se embeben en tiempo de build, por lo que se reciben
# como build args (son identificadores públicos de la SPA, no secretos).
ARG VITE_CLIENT_ID
ARG VITE_TENANT_ID
ARG VITE_REDIRECT_URI
ARG VITE_API_URL
ARG VITE_API_SCOPE
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID \
    VITE_TENANT_ID=$VITE_TENANT_ID \
    VITE_REDIRECT_URI=$VITE_REDIRECT_URI \
    VITE_API_URL=$VITE_API_URL \
    VITE_API_SCOPE=$VITE_API_SCOPE

COPY . .
RUN npm run build

# --- Etapa 2: servir con Nginx (SDD §7, §30 puerto 80) ---
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
