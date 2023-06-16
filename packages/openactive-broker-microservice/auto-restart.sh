#!/bin/bash

# auto-restart.sh allows the broker to restart itself if it crashes (e.g if its buckets expire), which is useful in some deployment scenarios.

while true; do
    npm start
    echo "openactive-broker-microservice exited with status $?. Restarting in 10 seconds..."
    sleep 10
done