# Stage 1: Build the Expo web application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# EXPO_PUBLIC_* vars are baked into the static bundle by the export step
# below, not read at container runtime. react-native/.env is gitignored, and
# COPY . . above does NOT reliably bring it into the build context — verified
# directly on Docker Desktop, which excludes gitignored files from the build
# context transfer even for a plain local build (not just CI/fresh clones).
# Always pass these explicitly:
#   docker build \
#     --build-arg EXPO_PUBLIC_API_BASE_URL_MS1=https://your-api-host/ \
#     --build-arg EXPO_PUBLIC_API_BASE_URL_MS2=https://your-secondary-api-host/ \
#     -t <image> .
# Written to .env.production.local, which Expo's CLI loads with higher
# precedence than .env for a production export, so a passed build-arg always
# wins even on a setup where .env genuinely is present. If not passed, this
# is a no-op, and EXPO_PUBLIC_* will bake in as literally "undefined".
ARG EXPO_PUBLIC_API_BASE_URL_MS1
ARG EXPO_PUBLIC_API_BASE_URL_MS2
RUN if [ -n "$EXPO_PUBLIC_API_BASE_URL_MS1" ]; then echo "EXPO_PUBLIC_API_BASE_URL_MS1=$EXPO_PUBLIC_API_BASE_URL_MS1" >> .env.production.local; fi
RUN if [ -n "$EXPO_PUBLIC_API_BASE_URL_MS2" ]; then echo "EXPO_PUBLIC_API_BASE_URL_MS2=$EXPO_PUBLIC_API_BASE_URL_MS2" >> .env.production.local; fi

# Build the web application
# For Expo SDK 50+, the default export command is 'npx expo export'
# which exports for all platforms, including web if configured.
RUN npx expo export -p web

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the build output to Nginx's html directory under the 'pomotask' subdirectory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
