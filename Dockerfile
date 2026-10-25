# Static site image for Coolify (or any Docker host).
# Stage 1 rebuilds and verifies the content; the image build fails if any example or solution breaks.
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN node tools/build.js

# Stage 2 serves only the site files with nginx on port 80.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/index.html /usr/share/nginx/html/
COPY --from=build /app/css /usr/share/nginx/html/css
COPY --from=build /app/js /usr/share/nginx/html/js
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
