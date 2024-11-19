FROM node:20 AS build-angular
WORKDIR /app
COPY ./text-search-app/package*.json ./text-search-app/
RUN cd text-search-app && npm install
COPY ./text-search-app/ ./text-search-app/
RUN cd text-search-app && npm run build --prod

FROM node:20
WORKDIR /server
COPY ./node-server/package*.json ./
RUN npm install --production
COPY ./node-server/ .
COPY --from=build-angular /app/text-search-app/dist/text-search-app/browser/ /server/src/public/
EXPOSE 3000
CMD ["npm", "start"]
