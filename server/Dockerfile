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

# Build the app (for production)
RUN if [ "$NODE_ENV" != "development" ]; then \
      npm run build; \
    fi

EXPOSE 3001

# Use a better startup command
CMD ["npm", "run", "dev"]