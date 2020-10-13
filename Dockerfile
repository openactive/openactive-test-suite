FROM node:12.19.0-alpine3.12 AS openactive.integration_test

WORKDIR /openactive

COPY packages /openactive/packages
COPY package.json /openactive/package.json
COPY package-lock.json /openactive/package-lock.json
COPY start.js /openactive/start.js

WORKDIR /openactive
RUN npm install

RUN cp -rf /openactive/packages/test-interface-criteria /openactive/packages/openactive-broker-microservice/node_modules/
RUN cp -rf /openactive/packages/test-interface-criteria /openactive/packages/openactive-integration-tests/node_modules/

VOLUME /openactive/packages/openactive-broker-microservice/config
VOLUME /openactive/packages/openactive-integration-tests/config

ENTRYPOINT npm start
