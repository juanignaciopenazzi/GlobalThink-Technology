# Etapa 1: Dependencias y compilación
FROM node:20-alpine AS builder
WORKDIR /app
# Copiamos solo los archivos de dependencias primero (optimiza la caché de Docker)
COPY package*.json ./
RUN npm ci
# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# Etapa 2: Imagen final y liviana
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Instalamos SOLO las dependencias de producción (excluye TypeScript, ESLint, etc.)
RUN npm ci --omit=dev
# Traemos la carpeta dist compilada de la etapa anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]