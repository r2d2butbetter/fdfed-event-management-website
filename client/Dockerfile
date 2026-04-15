# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

# Copy package info
COPY package*.json ./

# Install dependencies strictly
RUN npm ci

# Copy the rest of the app
COPY . .

# Allows dynamic assignment of env variable during Docker build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the react application (Vite outputs to /dist)
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# Copy the constructed Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output to Nginx's strictly served folder
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose externally via port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
