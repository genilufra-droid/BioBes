# Deploy cloud

Përdor MySQL/TiDB me SSL, secret manager për variables, domain HTTPS dhe backup të testuar. Build: pnpm install --frozen-lockfile && pnpm build; start: pnpm start. Konfiguro OAuth callback, DATABASE_URL dhe JWT_SECRET vetëm në secrets. Ruaj company scope në çdo query dhe monitoro logs, rate limits dhe migrimet.
