FROM node:18-alpine AS base

WORKDIR /app

FROM base AS build

# BETTER TO USE DUMB INIT IN CASE OF FORKING OR SUB THREAD TO MAKE SURE THE NODEJS APP GET THE SIGTERM
RUN --mount=type=cache,target=/var/cache/apk apk add --no-cache dumb-init

COPY package*.json ./

RUN npm ci \
    && npm prune --production \
    && rm -rf package-lock.json 

FROM base AS production

ENV NODE_ENV=production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build /app/. /app

COPY . .
USER node

EXPOSE 3000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]