FROM node:18-slim

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build will be done at runtime for dev or during build for prod
# For dev mode, we use ts-node-dev which needs the source
# For prod, uncomment the build step below
# RUN npm run build

EXPOSE 3000

# Development command (override in docker-compose for prod)
CMD ["npm", "run", "dev"]
