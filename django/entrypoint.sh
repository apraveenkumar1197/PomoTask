#!/bin/bash
set -e

# Cron jobs don't inherit the container's runtime environment (docker-compose
# `environment:` values) by default — cron starts each job with a minimal
# environment of its own. Capture the current environment now, safely quoted
# via bash's %q (handles values containing spaces/special characters, e.g.
# AUTH_PASSWORD), so the scheduled backup job can source it.
for var in $(compgen -e); do
    printf 'export %s=%q\n' "$var" "${!var}"
done > /etc/container_environment.sh

service cron start

exec "$@"
