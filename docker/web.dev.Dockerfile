# Web dev image — Angular dev server with live reload via bind mount.
FROM node:22-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

EXPOSE 4333

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4333", "--poll", "1000"]
