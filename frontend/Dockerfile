# Estágio 1: Build dos assets estáticos
FROM node:18-alpine as build-stage

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Estágio 2: Servidor de produção (Nginx)
FROM nginx:1.25-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
