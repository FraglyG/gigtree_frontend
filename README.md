# GigTree (Frontend)

This is the frontend GigTree. GigTree is a client to client freelance platform for informal workers in South Africa. I made this for a university project at Eduvos in 2025.

## Prerequisites

- Node.js
- NPM
- Caddy (Production)

## Quick Start

To get this running locally, run the following commands:

```bash
# Initial Setup
git clone https://github.com/FraglyG/gigtree_frontend
cd ./gigtree_frontend
npm install
npm run build

# Boot Production Preview Server (NOT FOR PRODUCTION, see below)
npm run start
```

For development

```bash
# Initial Setup
git clone https://github.com/FraglyG/gigtree_frontend
cd ./gigtree_frontend
npm install
npm run build

# Boot Development Server
npm run dev
```

## Production

For production, the files should be served via a Caddy reverse proxy. 
Works out of the box for the Nixpacks builder.