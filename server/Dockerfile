FROM node:20-alpine as builder

# ... (Copy package files, install dependencies) ...
# Copy source code

# *** BUILD THE TYPESCRIPT INTO JAVASCRIPT ***
RUN npm run build

# --- Final Production Stage ---
FROM node:20-alpine
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy the *compiled* application files from the builder stage
COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json .

EXPOSE 3001

# *** USE PRODUCTION START COMMAND ***
# This command runs the compiled JavaScript file directly with Node
CMD ["npm", "start"] # or CMD ["node", "dist/app.js"] if you prefer