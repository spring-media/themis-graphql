FROM node:8.11.4 as intermediate

# install git
RUN apt-get update
RUN apt-get install -y git

ARG GIT_USERNAME
ARG GIT_PASSWORD

# clone Git repository red-delivery
RUN git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/spring-media/red-delivery.git

FROM node:8.11.4

ARG ARTICLE_GRAPHQL_ENDPOINT
ARG ARTICLE_GRAPHQL_TOKEN
ARG IMAGE_HOST
ARG LOG_LEVEL
ARG NODE_ENV

# set working directory
WORKDIR /app

# copy project files and folders
COPY . /app

# copy datasources folder in cloned repository from previous image to working directory
COPY --from=intermediate /red-delivery/datasources /app/datasources

# install ALL node_modules, including 'devDependencies'
RUN npm install

RUN npm install graphql@0.13.2 graphql-tag@2.9.2 graphql-tools@3.0.2

RUN node index -s /app/datasources --build

# expose port
EXPOSE 8081

# command to be executed when running the image
CMD [ "node", "index", "-s", "/app/datasources"]
