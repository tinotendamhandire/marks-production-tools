# Use the slim Node image built for ARM (works on Pi 3/4/5 and x86)
FROM node:20-slim

WORKDIR /app

# Install dependencies first (cached layer — only rebuilds if package.json changes)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
