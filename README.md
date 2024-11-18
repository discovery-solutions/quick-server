# Quick Server

## Overview

**Quick Server** is a fast, easy-to-use framework for building real-time WebSocket and RESTful applications. It supports rapid development with minimal setup, leveraging JSON/YAML configuration for server setup, entity definition, and permission management.

With built-in CRUD routes, authentication strategies, file upload support, and flexible database integration, **Quick Server** simplifies the creation of powerful web applications.

## Features

### Present Features
- **WebSocket & REST API**: Serve both WebSocket and RESTful JSON-based endpoints.
- **Automatic CRUD Operations**:
  - Create
  - Read (List/Get)
  - Update
  - Delete
  - Bulk Insert
- **Authentication**:
  - JWT-based authentication
  - OAuth integration (Google, GitHub, and more)
  - Role-based permissions
- **Database Integrations**:
  - In-Memory DB
  - MongoDB
  - MySQL
  - PostgreSQL
  - SQLite
- **Full-Text Search:** Search across all entities for the result you're looking for.
- **Multi-Tenant Support**: Run multiple independent servers with unique configurations.
- **Extensibility**: Custom middleware, interceptors, and entity permissions.
- **Logging & Environment Support**:
  - Configurable logging with metadata
  - Support for `.env` variables

### Future Features
- File Uploads
- GraphQL Integration
- API Rate Limiting & Analytics
- Webhooks & Service Workers
- Multi-Language Support
- Email Service Integration
- Ecommerce and Blog Modules (Optional)

## Installation

Install the package using npm:

```bash
npm install github:discovery-solutions/quick-server
```

## Configuration

Quick Server uses a **YAML configuration** file for easy setup. Below is an example:

```yaml
developer:
  env: ".env"
  logger:
    formatted: true
    verbose: false

servers:
  - name: "Rest-Server"
    port: 3501
    type: "rest"
    format: "json"
    database: "mongodb"
    request:
      limit: 10         # Items per page
      timeout: 10       # Request timeout (seconds)
  - name: "Socket-Server"
    port: 3500
    type: "socket"
    database: "mongodb"

auth:
  strategies:
    jwt:
      secret: "super_secret_key"
      expiresIn: "1h"
      entity:
        name: "user"
        identifiers:
          - "email"
          - "password"
    oauth:
      google:
        clientId: "google_oauth_client_id"
        clientSecret: "google_oauth_client_secret"
        authUrl: "https://accounts.google.com/o/oauth2/auth"
        tokenUrl: "https://oauth2.googleapis.com/token"
        refreshToken:
          enabled: true
          expiration: "7d"
        entity:
          name: "user"
          identifier: "email"
          mapper:
            email: "email"
            name: "name"
            picture: "avatar"
  permissions:
    default:
      get: false
      list: false
      insert: false
      update: false
      delete: false
    entities:
      user:
        "*": 
          get: true
          list: true
        user:
          insert: true
          update: true
          delete: true
        post: 
          insert: true
          update: true
          delete: true
      company:
        "*": 
          get: true
          list: true
          insert: false
          update: false
          delete: false

databases:
  - type: mongodb
    key: "mongodb"
    uri: "{MONGODB_URI}"
    name: "quick-server"
    logs: true

entities:
  - name: "user"
    alias: "User"
    fields:
      name:
        type: "string"
        required: true
      email:
        type: "string"
        required: true
      avatar:
        type: "file"
      password:
        type: "string"
        required: true
        secure: true
    auth:
      type: "jwt"
      jwt:
        fields: ["email", "password"]
  - name: "company"
    alias: "Company"
    fields:
      name:
        type: "string"
        required: true
      document:
        type: "string"
        required: true
      phone: 
        type: "string"
      address: 
        type: "string"
    auth:
      type: "oauth"
      oauth:
        strategy: "google"
  - name: "post"
    alias: "Post"
    fields:
      title: "string"
      date: "date"
      content: "string"
```

## Usage

After configuration, run your server using the following code:

```ts
import { QuickServer } from "@discovery-solutions/quick-server";

const server = new QuickServer();

server.use((ctx) => {
  console.log('Custom middleware triggered');
  return ctx.status(200).json({ message: 'Hello World' });
});

server.start();
```

This will launch your WebSocket and REST servers based on the configuration.

## Roadmap

- [x] JWT & OAuth Authentication
- [x] Configurable Permissions
- [x] CRUD Route Generation
- [x] Bulk Data Operations
- [x] Multi-Tenant Support
- [ ] API Documentation Generator
- [ ] Webhooks and Service Workers
- [ ] GraphQL Support
- [ ] API Analytics