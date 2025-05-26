
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S whatsapp -u 1001

# Change ownership
RUN chown -R whatsapp:nodejs /app
USER whatsapp

# Start the application
CMD ["npm", "start"]
