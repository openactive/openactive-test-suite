#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# clear and re-create the out directory
rm -rf publish || exit 0;
mkdir -p publish/example-output/random;
mkdir -p publish/example-output/controlled;

echo 'Setting up publish directory...'
# go to the publish directory and create a *new* Git repo
cd publish
git init

# inside this git repo we'll pretend to be a new user
git config user.name "Travis CI"
git config user.email "travis@openactive.org"

cd ..

# Copy redirect template page to root
echo 'Copy redirect template...'
cp ./redirect.html ./publish/index.html

# Install dependencies
echo 'Installing dependencies...'
npm install --prefix packages/openactive-broker-microservice
npm install --prefix packages/openactive-integration-tests

# Start broker microservice in the background
echo 'Starting broker microservice...'
npm start --prefix packages/openactive-broker-microservice &
pid=$!

# Run tests in random mode
echo 'Emptying output directory...'
rm -rf ./packages/openactive-integration-tests/output/
echo 'Running integration tests with useRandomOpportunities: true...'
NODE_CONFIG='{"useRandomOpportunities": true, "generateConformanceCertificate": true, "conformanceCertificateId": "https://openactive.io/openactive-test-suite/example-output/random/certification/"}' npm test --prefix packages/openactive-integration-tests --runInBand -- test/features/
echo 'Copying output files...'
cp -R ./packages/openactive-integration-tests/output/* ./publish/example-output/random/

# Run tests using booking system Test Interface
echo 'Emptying output directory...'
rm -rf ./packages/openactive-integration-tests/output/
echo 'Running integration tests with useRandomOpportunities: false...'
NODE_CONFIG='{"useRandomOpportunities": false, "generateConformanceCertificate": true, "conformanceCertificateId": "https://openactive.io/openactive-test-suite/example-output/controlled/certification/"}' npm test --prefix packages/openactive-integration-tests --runInBand -- test/features/
echo 'Copying output files...'
cp -R ./packages/openactive-integration-tests/output/* ./publish/example-output/controlled/

# Kill broker microservice
echo 'Killing broker microservice...'
kill $pid

cd publish

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
echo 'Committing files to Git...'
git add .
git commit -m "Deploy to GitHub Pages - Static [ci skip]"

# Force push from the current repo's master branch to the remote
# repo's gh-pages branch. (All previous history on the gh-pages branch
# will be lost, since we are overwriting it.) We should also redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
if [ "$TRAVIS_BRANCH" = "master" -a "$TRAVIS_PULL_REQUEST" = "false" ]; then
  echo 'Pushing to gh-pages...';
  git push --force "https://${GH_TOKEN}@${GH_REF}" master:gh-pages;
else
  echo 'No push to gh-pages as not a direct commit to master';
fi

cd ..
