# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# ─── Stage 2: Production Image ────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S cabpro && adduser -S cabpro -G cabpro

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Change ownership to non-root user
RUN chown -R cabpro:cabpro /app

USER cabpro

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

# Use dumb-init to handle PID 1 signals correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
