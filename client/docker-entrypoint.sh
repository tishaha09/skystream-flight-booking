#!/bin/sh
set -e

# Default PORT to 80 if not provided (Render passes PORT=10000)
export PORT="${PORT:-80}"

# Determine and normalize BACKEND_URL
# If unset or empty, fallback to the deployed production backend service
if [ -z "$BACKEND_URL" ]; then
  BACKEND_URL="https://skystream-backend-kuri.onrender.com"
fi

# Strip trailing slash(es)
BACKEND_URL="$(echo "$BACKEND_URL" | sed 's:/*$::')"

# Ensure scheme (http:// or https://)
case "$BACKEND_URL" in
  http://*|https://*)
    # Already has protocol scheme
    ;;
  *)
    case "$BACKEND_URL" in
      backend*|localhost*)
        BACKEND_URL="http://$BACKEND_URL"
        ;;
      *)
        case "$BACKEND_URL" in
          *.*)
            BACKEND_URL="https://$BACKEND_URL"
            ;;
          *)
            BACKEND_URL="https://${BACKEND_URL}.onrender.com"
            ;;
        esac
        ;;
    esac
    ;;
esac

export BACKEND_URL

echo "================================================="
echo " SkyStream Frontend Production Container Startup"
echo " Listening on PORT: $PORT"
echo " Upstream API BACKEND_URL: $BACKEND_URL"
echo "================================================="

# Crucial: Specify ONLY '${PORT} ${BACKEND_URL}' to envsubst.
# This prevents envsubst from wiping Nginx variables ($uri, $host, $proxy_host,
# $remote_addr, $proxy_add_x_forwarded_for, $scheme, $http_upgrade).
if [ -f /etc/nginx/templates/default.conf.template ]; then
  envsubst '${PORT} ${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Verify the generated configuration
nginx -t

# Start Nginx
exec "$@"
