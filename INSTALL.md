# Self-hosted installation

Run the application with Docker Compose and a fresh MySQL volume:

```bash
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, AUTH_PROVIDER=local, and LOCAL_AUTH_SETUP_SECRET in .env
docker compose up --build -d
docker compose ps
curl -fsS http://localhost:3000/healthz
```

The container starts with `AUTO_MIGRATE=true` and applies the committed Drizzle migrations before serving traffic. The readiness endpoint must return HTTP 200 with database connectivity and matching applied/expected migration counts.

Create the first local owner exactly once. Do not put the setup secret in the JSON body or shell history:

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/local-auth/bootstrap \
  -H 'Content-Type: application/json' \
  -H "x-local-auth-setup-secret: ${LOCAL_AUTH_SETUP_SECRET}" \
  --data '{"email":"owner@example.com","password":"change-this-long-password","name":"Owner","companyName":"Example Company"}'
```

A successful first run returns HTTP 201 and sets the session cookie. Subsequent bootstrap attempts return HTTP 409. Login uses the same cookie flow:

```bash
curl -i -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/local-auth/login \
  -H 'Content-Type: application/json' \
  --data '{"email":"owner@example.com","password":"change-this-long-password"}'
```

Use a randomly generated secret of at least 32 characters for `LOCAL_AUTH_SETUP_SECRET`. Never commit `.env` or real credentials.
