# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Create directory for the base path
RUN mkdir -p /usr/share/nginx/html/sheconnect

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html/sheconnect

# Create nginx configuration to handle React Router and the base path
RUN echo 'server { \
    listen 80; \
    location /sheconnect/ { \
        alias /usr/share/nginx/html/sheconnect/; \
        try_files $uri $uri/ /sheconnect/index.html; \
    } \
    location / { \
        rewrite ^/$ /sheconnect/ redirect; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
