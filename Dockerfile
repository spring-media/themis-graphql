FROM node:8.11.1

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8081

CMD [ "npm", "run", "dev" ]
