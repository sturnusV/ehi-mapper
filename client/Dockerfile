FROM node:20-alpine

# Add build arguments for better caching
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies based on environment
RUN if [ "$NODE_ENV" = "development" ]; then \
      npm ci; \
    else \
      npm ci --only=production; \
    fi

# Copy source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]