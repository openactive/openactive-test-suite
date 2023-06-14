FROM node:14-alpine

# Note WORKDIR must not be used for images that are used by GitHub Actions, as it will be overwritten

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
COPY package*.json /openactive-test-suite/
COPY packages/openactive-broker-microservice/package*.json /openactive-test-suite/packages/openactive-broker-microservice/
COPY packages/openactive-integration-tests/package*.json /openactive-test-suite/packages/openactive-integration-tests/
COPY packages/openactive-openid-test-client/package*.json /openactive-test-suite/packages/openactive-openid-test-client/
COPY packages/test-interface-criteria/package*.json /openactive-test-suite/packages/test-interface-criteria/

# Set unsafe-perm to true to allow npm `install` scripts to run
RUN cd /openactive-test-suite && npm config set unsafe-perm true && npm install

# Bundle app source
COPY . /openactive-test-suite/

RUN echo -e "P2sswrd!!!\nP2sswrd!!!" | passwd root
RUN mkdir -p /root/.ssh
RUN chmod 0700 /root/.ssh
RUN apk add openrc openssh
RUN ssh-keygen -A
RUN sed -i 's/prohibit-password/yes/' /etc/ssh/sshd_config
RUN echo 'StrictHostKeyChecking=no' >> /etc/ssh/ssh_config
RUN echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config
RUN mkdir -p /root/.ssh
RUN chown -R root:root /root/.ssh;chmod -R 700 /root/.ssh
RUN mkdir -p /run/openrc
RUN touch /run/openrc/softlevel

EXPOSE 3000
## Specify the working directory explicitly as GitHub Actions will overwrite it
## Copy any config file specified by `INPUT_CONFIG` to the config directory (used by GitHub Actions)
ENTRYPOINT rc-status; rc-service sshd start; ( ( [ -f "${INPUT_CONFIG}" ] && cp "${INPUT_CONFIG}" /openactive-test-suite/config/ ) || true ) && cd /openactive-test-suite && npm start