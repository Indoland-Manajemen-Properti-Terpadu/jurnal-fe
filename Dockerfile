FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for yarn 4
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN yarn install --immutable

COPY . .

# Build arg for API base URL (baked into static build)
ARG VITE_API_BASE_URL=https://jurnal-api.proapps.id
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npx vite build

# Production stage - serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
