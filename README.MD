# PO Tracker Dashboard

A dashboard for creating and tracking purchase orders. This is a replacement for the internal PIMA system.

## Table of Contents

## Build Instructions

This project can be built with either Windows or Linux.

### Dependencies

1. Rust 1.91 or newer
2. Node 20 or newer
3. pnpm 10 or newer
4. Docker (optional but recommended)
5. LLVM (linker only) - Required for the email service

### Windows

> ### Note:
> You can Install LLVM using winget
> ```powershell
> winget install LLVM.LLVM
> ```

#### Clone the repo

```powershell
git clone https://github.com/Mardens-Inc/po-tracker.git --branch dashboard
```

#### Install the dependencies

```powershell
pnpm install
```

#### Setup the environment variables
These values are setup with development values by default, which are okay for a development environment. For production, you should set these values to secure values.
You can find the values in the [.cargo/config.toml](.cargo/config.toml)

| Key                     | Description                             |
|-------------------------|-----------------------------------------|
| MYSQL_CONNECTION_STRING | MySQL database connection string        |
| JWT_SECRET              | Secret key for JWT token generation     |
| HASH_SALT               | Salt value for password hashing         |
| SMTP_HOST               | SMTP server hostname for email delivery |
| SMTP_USERNAME           | Username for SMTP authentication        |
| SMTP_PASSWORD           | Password for SMTP authentication        |


#### Build the project
```powershell
$env:MYSQL_CONNECTION_STRING="mysql://user:password@localhost:3306/po_tracker"
$env:JWT_SECRET="supersecret"
$env:HASH_SALT="saltysalt"
$env:SMTP_HOST="smtp.example.com"
$env:SMTP_USERNAME="smtpuser"
$env:SMTP_PASSWORD="password123"
pnpm run build
```

### Linux

#### Clone the repo

```bash
git clone https://github.com/Mardens-Inc/po-tracker.git --branch dashboard
```

#### Install the dependencies

```bash
pnpm install
```

#### Setup the environment variables
These values are setup with development values by default, which are okay for a development environment. For production, you should set these values to secure values.
You can find the values in the [.cargo/config.toml](.cargo/config.toml)

| Key                     | Description                             |
|-------------------------|-----------------------------------------|
| MYSQL_CONNECTION_STRING | MySQL database connection string        |
| JWT_SECRET              | Secret key for JWT token generation     |
| HASH_SALT               | Salt value for password hashing         |
| SMTP_HOST               | SMTP server hostname for email delivery |
| SMTP_USERNAME           | Username for SMTP authentication        |
| SMTP_PASSWORD           | Password for SMTP authentication        |


#### Build the project
```bash
export MYSQL_CONNECTION_STRING="mysql://user:password@localhost:3306/po_tracker"
export JWT_SECRET="supersecret"
export HASH_SALT="saltysalt"
export SMTP_HOST="smtp.example.com"
export SMTP_USERNAME="smtpuser"
export SMTP_PASSWORD="password123"
pnpm run build
```