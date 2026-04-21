FROM node:20-alpine

WORKDIR /app

# Copy package info
COPY package*.json ./

# Install dependencies (avoiding dev dependencies)
RUN npm ci

# Copy application files
COPY . .

# Expose backend port natively
EXPOSE 3000

# Start server
CMD ["npm", "start"]
