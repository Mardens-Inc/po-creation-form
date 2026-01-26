FROM rust:1.92-alpine AS builder
LABEL authors="Drew Chase"
WORKDIR /app

# Install system dependencies FIRST (cached unless Dockerfile changes)
RUN apk update && apk add --no-cache nodejs npm musl-dev
RUN npm i vite pnpm -g

# Copy ONLY dependency manifests first
COPY Cargo.toml Cargo.lock ./
COPY crates/web/Cargo.toml ./crates/web/
COPY package.json pnpm-lock.yaml ./

# Install project dependencies (cached unless manifests change)
RUN pnpm i --no-frozen-lockfile --force

# NOW copy source code (only this layer invalidates on code changes)
COPY . .

# Build the project (frontend and backend)
RUN pnpm run "web:build"
RUN cargo build --release
RUN strip target/release/po_tracker_dashboard

FROM scratch AS artifact
COPY --from=builder /app/target/release/po_tracker_dashboard /
