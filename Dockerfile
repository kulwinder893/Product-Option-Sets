FROM node:20-alpine
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

COPY package.json package-lock.json* ./

# Install all deps so `react-router build` / vite can run, then prune
RUN npm ci && npm cache clean --force

COPY . .

RUN npx prisma generate && npm run build && npm prune --omit=dev

CMD ["npm", "run", "docker-start"]
