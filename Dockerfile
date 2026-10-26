# Image for Coolify (or any Docker host).
# Stage 1 rebuilds and verifies the content; the image build fails if any example or solution breaks.
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN node tools/build.js

# Stage 2 runs server.js, a small static server (no npm dependencies). Accounts live in Supabase.
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/server.js /app/index.html ./
COPY --from=build /app/css ./css
COPY --from=build /app/js ./js
ENV PORT=80 NODE_ENV=production
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
CMD ["node", "server.js"]
