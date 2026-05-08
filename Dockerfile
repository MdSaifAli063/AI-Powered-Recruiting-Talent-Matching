# Stage 1: Build Frontend
FROM node:24-slim as frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Final Image
FROM node:24-slim
WORKDIR /app

# Copy Backend files
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .

# Copy built frontend from Stage 1 to Backend's public folder
COPY --from=frontend-build /frontend/dist ./public

# Ensure uploads folder exists
RUN mkdir -p uploads

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "server.js"]
