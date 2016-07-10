#!/usr/bin/env sh

YELLOW=`tput setaf 3`
yecho () {
  echo "${YELLOW}$1"
}

# force script to error out at first error
set -e

### XXX how do we make this dynamic without tags?
if [ "$TRAVIS_TAG" == "" ]; then
  echo "No tags found, no need for a build since we currently have no tests."
  exit 0
fi

yecho "### Installing Meteor ###"
if [ ! -d "$DIRECTORY" ]; then curl https://install.meteor.com | /bin/sh; fi
export PATH=$PATH:$HOME/.meteor

yecho "### Installing NPM deps ###"
npm install
npm link

yecho "### Apollos Setup ###"
meteor npm run apollos setup newspring

yecho "### Settings Grab ###"
cd ../sites/newspring/.remote
git clone git@github.com:NewSpring/ops-settings.git settings
cd settings && git checkout refactor # temp until confirmed working

# yecho "### Preparing Gagarin test build ###"
# npm install -g gagarin
# cp ./.remote/settings/sites/app.newspring.io/alpha.settings.json ./settings.json
# meteor build --directory ./.gagarin/local --server localhost:3000
# cd ./.gagarin/local/bundle/programs/server/ && npm i
