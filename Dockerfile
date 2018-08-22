FROM node:8.11.1
# set working directory
WORKDIR /app
# copy project files and folders
COPY . /app
# install ALL node_modules, including 'devDependencies'
RUN npm install

# TODO: check out red-delivery project and copy datasources to /app

# expose port
EXPOSE 8081
# command to be executed when running the image
CMD [ "npm", "run", "dev" ]
