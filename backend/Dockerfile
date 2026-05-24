FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
# URL нужен только на этапе generate; к БД на build-стадии не подключаемся
ENV DATABASE_URL="postgresql://educrm:educrm@localhost:5432/educrm?schema=public"
RUN npx prisma generate

COPY src ./src
COPY docker-entrypoint.sh ./
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
