#!/bin/sh
# We have a custom entrypoint script for Docker, which is run with `exec`.
# The `exec` command replaces the current process with the new process, which
# enables signal interactivity (e.g. Ctrl-C).

## Specify the working directory explicitly as GitHub Actions will overwrite it
## Copy any config file specified by `INPUT_CONFIG_DIR` to the config directory (used by GitHub Actions)
if [ -f "${INPUT_CONFIG_DIR}" ]; then
  cp "${INPUT_CONFIG_DIR}" /openactive-test-suite/config/
  ## Reset INPUT_CONFIG_DIR so that the test suite does not use it
  export INPUT_CONFIG_DIR=
fi

# Change directory and start the app
cd /openactive-test-suite && exec npm start -- "$@"
