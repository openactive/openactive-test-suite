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
# where available (npm@5+)
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

# RUN echo "root:P2sswrd!!!" | chpasswd
# RUN mkdir -p /root/.ssh
# RUN chmod 0700 /root/.ssh
# RUN apk add openrc openssh
# RUN ssh-keygen -A
# RUN sed -i 's/prohibit-password/yes/' /etc/ssh/sshd_config
# RUN echo 'StrictHostKeyChecking=no' >> /etc/ssh/ssh_config
# RUN echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config
# RUN mkdir -p /run/openrc
# RUN touch /run/openrc/softlevel

# Expose port 3000 for openactive-broker-microservice
EXPOSE 3000

RUN chmod +x /openactive-test-suite/docker-entrypoint.sh
ENTRYPOINT ["/openactive-test-suite/docker-entrypoint.sh"]
# ## Specify the working directory explicitly as GitHub Actions will overwrite it
# ## Copy any config file specified by `INPUT_CONFIG` to the config directory (used by GitHub Actions)
# ENTRYPOINT ( [ -f "${INPUT_CONFIG}" ] && cp "${INPUT_CONFIG}" /openactive-test-suite/config/ ) ; cd /openactive-test-suite && npm start -- "$@"
# # ENTRYPOINT rc-status; rc-service sshd start; echo 'IP Address:'; hostname -i; echo 'Hostname:'; hostname; echo 'Hostname (full):'; hostname -f; echo 'Hostname (short):'; hostname -s; echo 'Starting...'; ( [ -f "${INPUT_CONFIG}" ] && cp "${INPUT_CONFIG}" /openactive-test-suite/config/ ) ; cd /openactive-test-suite && npm start ; sleep 60m