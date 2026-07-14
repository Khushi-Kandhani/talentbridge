FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Apply migrations then start the API. `prisma migrate deploy` is safe to run
# every container start — it only applies pending migrations.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
