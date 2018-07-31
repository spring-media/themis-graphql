# Production Dockerfile (Dockerfile)

# ---- Base Node ----
FROM node:8.11.3 AS base
# docker build argument
ARG PACKAGE_VERSION
# image metadata
LABEL NAME="red-gql" VERSION=${PACKAGE_VERSION}
# set working directory
WORKDIR /app
# copy project files and folders
COPY . /app

# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN npm install --only=production
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install
# build client and server
#RUN npm run build

# ---- Test ----
# run linters and tests
#FROM dependencies AS test
# RUN npm run lint && npm run test
#RUN npm run test

# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /app/prod_node_modules /app/node_modules
# expose port
EXPOSE 8081
# command to be executed when running the image
CMD [ "npm", "run", "dev" ]
