#!/bin/bash

# Script to debug Coolify container issues

echo "🔍 Checking running containers..."
docker ps -a | grep sport-backend

echo ""
echo "📋 Recent container logs (last 50 lines):"
CONTAINER_ID=$(docker ps -a | grep sport-backend | head -1 | awk '{print $1}')
if [ -n "$CONTAINER_ID" ]; then
    echo "Container ID: $CONTAINER_ID"
    echo "=== Container Logs ==="
    docker logs --tail 50 $CONTAINER_ID
else
    echo "No container found"
fi

echo ""
echo "🔍 Container exit code:"
docker inspect $CONTAINER_ID --format='{{.State.ExitCode}}' 2>/dev/null || echo "Unable to get exit code"

echo ""
echo "🔍 Container state:"
docker inspect $CONTAINER_ID --format='{{.State.Status}}' 2>/dev/null || echo "Unable to get state"
