# Image for Coolify (or any Docker host).
# Stage 1 rebuilds and verifies the content; the image build fails if any example or solution breaks.
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN node tools/build.js

# Stage 2 runs server.js: the site files plus the small account API (no npm dependencies).
# Accounts and progress are written to /data, so mount a persistent volume there.
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/server.js /app/index.html ./
COPY --from=build /app/css ./css
COPY --from=build /app/js ./js
ENV PORT=80 DATA_DIR=/data NODE_ENV=production
VOLUME /data
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/api/me >/dev/null || exit 1
CMD ["node", "server.js"]
