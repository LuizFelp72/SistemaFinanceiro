FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY migrations ./migrations
COPY scripts ./scripts
COPY src ./src

USER node
EXPOSE 3000

# As migrações são idempotentes e protegidas por advisory lock; só depois a API inicia.
CMD ["sh", "-c", "npm run db:migrate && exec node src/server.js"]
