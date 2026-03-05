# URL Shortener

A URL shortener built with Node.js, Express, MongoDB, and EJS.  
Features include user signup/login with JWT-based authentication, role-based access control, CSRF protection, and  rate limiting.

## Requirements

- Node.js (LTS)
- MongoDB running locally or accessible via connection string

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Set at least:

   - `MONGODB_URL` – your MongoDB connection string
   - `JWT_SECRET` – a long random secret string
   - `PORT` (optional, defaults to `8001`)

3. Start the server:

   ```bash
   npm start
   ```

4. Open the app in your browser:

   - Home (requires login): `http://localhost:8001/`
   - Signup: `http://localhost:8001/signup`
   - Login: `http://localhost:8001/login`

## Main Features

- Shorten URLs and track click counts per URL
- User authentication with JWT stored in HTTP-only cookies
- Passwords stored as bcrypt hashes (no plain text)
- CSRF protection for form submissions
- Basic rate limiting on URL creation and redirect endpoints

