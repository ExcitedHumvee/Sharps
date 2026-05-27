# Sharps - Image Sharing Web Application

## Overview

Sharps is a web application that allows users to share, upload, edit, and delete images known as "Sharps." It provides a platform similar to Instagram, where users can interact with each other by commenting on Sharps and leaving ratings.

## Features

- **CRUD Operations** for Sharps and Reviews (Create, Read, Update, Delete)
- **User Authentication** via PassportJS (register, login, logout)
- **Image Upload** via Multer + Cloudinary
- **Interactive Maps** via MapBox (cluster map on index, individual location maps)
- **Input Validation** via Joi with HTML sanitization
- **Security** — Helmet CSP, rate limiting, mongo sanitization, session hardening

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Templating | EJS + ejs-mate |
| Auth | Passport + passport-local-mongoose |
| Image Storage | Cloudinary |
| Maps | MapBox GL JS |
| Validation | Joi + sanitize-html |

## Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** running locally on port 27017

### Setup

```bash
git clone https://github.com/ExcitedHumvee/Sharps.git
cd sharps
npm install
```

### Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Required variables in `.env`:

```
PORT=3000
DB_URL=mongodb://localhost:27017/sharp
MAPBOX_TOKEN=your_mapbox_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
SECRET=your_session_secret
```

### Seed Data

```bash
node seeds/index.js
```

This creates 3 test users and 300 sharps with reviews.

| Username | Password |
|----------|----------|
| `demo` | `password123` |
| `alice` | `password123` |
| `bob` | `password123` |

### Run

```bash
npm start        # Start the server
npm run dev      # Start with nodemon (auto-reload)
npm test         # Run the API test suite
```

Open [http://localhost:3000](http://localhost:3000/).

## API Test Suite

The test script (`test/api.test.js`) starts the server, then runs through all endpoints:

- Public pages (home, login, register)
- Registration and session handling
- Auth protection (redirect for unauthenticated users)
- Sharps CRUD (list, view, create review)
- Logout flow
- Error handling (404, invalid IDs)
- Rate limiting headers
- Security headers (CSP, X-Content-Type-Options)

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start with nodemon for development |
| `npm test` | Run the API test suite |

## License

MIT License

## Contact

Stany Desa — [stanydesa@live.com](mailto:stanydesa@live.com)
