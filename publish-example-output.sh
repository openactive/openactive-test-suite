#!/bin/bash

# clear and re-create the out directory
rm -rf publish || exit 0;
mkdir publish;
mkdir publish/random;
mkdir publish/controlled;

# go to the publish directory and create a *new* Git repo
cd publish
git init

# inside this git repo we'll pretend to be a new user
git config user.name "Travis CI"
git config user.email "travis@openactive.org"

cd ..

# Install dependencies
npm install --prefix packages/openactive-broker-microservice
npm install --prefix packages/openactive-integration-tests

# Start broker microservice in the background
npm start --prefix packages/openactive-broker-microservice &
pid=$!

# Run tests in random mode
rm -rf ./packages/openactive-integration-tests/output/
NODE_CONFIG='{"useRandomOpportunities": true}' npm test --prefix packages/openactive-integration-tests --runInBand -- test/features/
cp ./packages/openactive-integration-tests/output/* ./publish/random/

# Run tests using booking system Test Interface
rm -rf ./packages/openactive-integration-tests/output/
NODE_CONFIG='{"useRandomOpportunities": false}' npm test --prefix packages/openactive-integration-tests --runInBand -- test/features/
cp ./packages/openactive-integration-tests/output/* ./publish/controlled/

# Kill broker microservice
kill $pid

cd publish

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
git add .
git commit -m "Deploy to GitHub Pages - Static"

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
# FIXME should be authorised via key
git push --force "https://${GH_TOKEN}@${GH_REF}" master:gh-pages

cd ..