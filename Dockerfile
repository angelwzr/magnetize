# Use Node.js Alpine as a base for a small image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application and set ownership to node user
COPY --chown=node:node . .

# Switch to non-root user
USER node

# Expose the application's port
EXPOSE 3000

# Health check to ensure the container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
