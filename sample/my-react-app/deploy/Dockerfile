FROM docker.io/library/node:22.21.1-alpine3.23 AS node
FROM docker.io/library/nginx:1.29.3-alpine3.22 AS nginx

FROM node AS deps
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci

FROM node AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx AS runner
COPY --from=builder /workspace/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/templates/default.conf.template
CMD /docker-entrypoint.d/20-envsubst-on-templates.sh && \
    nginx -g 'daemon off;'
EXPOSE 3000