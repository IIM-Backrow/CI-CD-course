# Multi-stage Dockerfile for the backend

# Stage 1: Build (install dev deps so tsc is available)
FROM node:20.11.0-alpine AS build
WORKDIR /workspace

# Copy only server package files first for reliable caching
COPY package*.json .

# Copy the server source
COPY . .

WORKDIR /workspace

# Install all dependencies (including devDependencies) so TypeScript compiler (tsc) is available
RUN npm ci

# Build the application (will use the locally installed tsc)
RUN npm run build

# Stage 2: Production
FROM node:20.11.0-alpine AS prod
WORKDIR /app

# Copy build artifacts (use absolute path from build stage)
COPY --from=build /workspace/dist ./dist

# Copy package files to install production deps only (from build stage)
COPY --from=build /workspace/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

EXPOSE 3001
CMD [ "node", "dist/index.js" ]
