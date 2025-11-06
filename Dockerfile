# Use node version 23.9.0
#FROM node:23.9.0
FROM node:23-alpine

LABEL maintainer="Uny Li <sli359@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Use port 8080 in service
ENV PORT=8080

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
 
# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Use /app as working directory
WORKDIR /app

#Copy the package.json and package-lock.json
COPY package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080
