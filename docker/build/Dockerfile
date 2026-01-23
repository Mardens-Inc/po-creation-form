FROM rust:1.92-alpine AS builder
LABEL authors="Drew Chase"
WORKDIR /app
COPY . .
RUN apk update

# Install Dependencies
RUN apk add --no-cache nodejs npm musl-dev
RUN npm i vite pnpm -g

# Install project dependencies (force clean install without prompts)
RUN pnpm i --no-frozen-lockfile --force
# Build the project
# This will build both the frontend and the backend
RUN pnpm run "web:build"
RUN cargo build --release
RUN strip target/release/po_creation_dashboard


#RUN apk add --no-cache npm openssl-dev pkgconfig musl-dev
#RUN npm i pnpm -g
#RUN CI=true pnpm i
#RUN CI=true pnpm run web:build

FROM scratch AS artifact
COPY --from=builder target/release/po_creation_dashboard /