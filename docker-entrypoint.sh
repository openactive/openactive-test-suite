#!/bin/sh
# We have a custom entrypoint script for Docker, which is run with `exec`.
# The `exec` command replaces the current process with the new process, which
# enables signal interactivity (e.g. Ctrl-C).

## INPUT_CONFIG_DIR and INPUT_CONFIG_FILE relate to the `config_dir` and `config_file` inputs in GitHub Actions
## The below is used by the GitHub Action

## Specify the working directory explicitly as GitHub Actions will overwrite it
## Copy any config directory specified by `INPUT_CONFIG_DIR` to the config directory
if [ -f "${INPUT_CONFIG_DIR}" ]; then
  cp "${INPUT_CONFIG_DIR}" /openactive-test-suite/config/
  ## Reset NODE_CONFIG_DIR so that the test suite does not use it, to ensure that this directory is used
  export NODE_CONFIG_DIR=
fi

## Specify the working directory explicitly as GitHub Actions will overwrite it
## Copy any config file specified by `INPUT_CONFIG_FILE` to the config directory
if [ -f "${INPUT_CONFIG_FILE}" ]; then
  cp "${INPUT_CONFIG_FILE}" /openactive-test-suite/config/dev.json
  ## Configure test suite to use this file
  export NODE_ENV=dev
  export NODE_APP_INSTANCE=
  export NODE_CONFIG_DIR=
fi

# Change directory and start the app
cd /openactive-test-suite && exec npm start -- "$@"
