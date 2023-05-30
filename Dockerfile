FROM node:14-alpine

# Create app directory
WORKDIR /openactive-test-suite

# Installs latest Chromium package
RUN apk update && \
    apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Headless Chrome requires --no-sandbox in order to work in a Docker environment.
# https://docs.travis-ci.com/user/chrome#sandboxing
# https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/troubleshooting.md
ENV CHROMIUM_FLAGS="--no-sandbox --disable-setuid-sandbox --disable-gpu"

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

# Bundle app source
COPY . .

EXPOSE 3000
ENTRYPOINT ["npm", "start"]