FROM node:18.17.1-alpine

# Note WORKDIR must not be used for images that are used by GitHub Actions, as it will be overwritten

# Installs latest Chromium package (https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine)
RUN apk update && \
    apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# The build uses the Non-root User (https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#non-root-user)
# This allows npm `install` scripts to run
# This also means we don't need --no-sandbox for puppeteer to run (https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine)
USER node

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+).
# package files are copied before the rest of the files to allow for caching of
# the npm install step.
COPY --chown=node:node package*.json /openactive-test-suite/
COPY --chown=node:node packages/openactive-broker-microservice/package*.json /openactive-test-suite/packages/openactive-broker-microservice/
COPY --chown=node:node packages/openactive-integration-tests/package*.json /openactive-test-suite/packages/openactive-integration-tests/
COPY --chown=node:node packages/openactive-openid-client/package*.json /openactive-test-suite/packages/openactive-openid-client/
COPY --chown=node:node packages/openactive-openid-browser-automation/package*.json /openactive-test-suite/packages/openactive-openid-browser-automation/
COPY --chown=node:node packages/openactive-openid-test-cli/package*.json /openactive-test-suite/packages/openactive-openid-test-cli/
COPY --chown=node:node packages/test-interface-criteria/package*.json /openactive-test-suite/packages/test-interface-criteria/

# Build the app
RUN cd /openactive-test-suite && npm install

# Bundle app source
COPY --chown=node:node . /openactive-test-suite/

# Expose port 3000 for openactive-broker-microservice
EXPOSE 3000

RUN chmod +x /openactive-test-suite/docker-entrypoint.sh
ENTRYPOINT ["/openactive-test-suite/docker-entrypoint.sh"]