FROM node:14-alpine

# Create app directory
WORKDIR /openactive

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY packages/openactive-broker-microservice/package*.json ./packages/openactive-broker-microservice/
COPY packages/openactive-integration-tests/package*.json ./packages/openactive-integration-tests/
COPY packages/openactive-openid-test-client/package*.json ./packages/openactive-openid-test-client/
COPY packages/test-interface-criteria/package*.json ./packages/test-interface-criteria/

# Set unsafe-perm to true to allow install scripts to run
RUN npm config set unsafe-perm true
RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 3000
ENTRYPOINT ["npm", "start"]