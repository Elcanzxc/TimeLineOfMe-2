FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=""
ARG VITE_HUB_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_HUB_URL=$VITE_HUB_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build for production
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create SSL-enabled config as alternative
RUN printf 'server {\n\
    listen 80;\n\
    return 301 https://$host$request_uri;\n\
}\n\
server {\n\
    listen 443 ssl;\n\
    ssl_certificate /etc/nginx/ssl/fullchain.pem;\n\
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;\n\
    ssl_protocols TLSv1.2 TLSv1.3;\n\
    client_max_body_size 50m;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location /api/ {\n\
        proxy_pass http://api:8080/api/;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        client_max_body_size 50m;\n\
    }\n\
    location /hubs/ {\n\
        proxy_pass http://api:8080/hubs/;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection "Upgrade";\n\
        proxy_set_header Host $host;\n\
        proxy_read_timeout 86400s;\n\
    }\n\
}\n' > /etc/nginx/conf.d/ssl.conf.bak

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
