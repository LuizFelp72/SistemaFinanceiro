FROM node:22-alpine AS frontend

WORKDIR /app
COPY Frontend/SistemaFinanceiro/package.json Frontend/SistemaFinanceiro/package-lock.json ./
RUN npm ci
COPY Frontend/SistemaFinanceiro ./
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend /app/dist /usr/share/nginx/html
