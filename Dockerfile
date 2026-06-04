FROM node:20-alpine
WORKDIR /app

# 1. Dependencias primero (capa cacheable). Este proyecto no tiene
#    dependencias externas, pero mantenemos el patrón correcto.
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# 2. Código de la aplicación
COPY . .

# 3. Puerto y arranque
EXPOSE 3000
CMD ["node", "src/server.js"]
