# Environment variables

Ky dokument është ekuivalent i sigurt i `.env.example`; vlerat reale nuk ruhen në repository. Përdor secret manager-in e host-it ose një `.env` lokal të përjashtuar nga Git.

| Variable | Përdorimi |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | session/cookie signing |
| `VITE_APP_ID` | OAuth application id |
| `OAUTH_SERVER_URL` | OAuth backend |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal |
| `OWNER_OPEN_ID`, `OWNER_NAME` | owner metadata |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` | server-side built-in API |
| `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` | browser API access |
| `VITE_APP_TITLE`, `VITE_APP_LOGO` | application branding |
| `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID` | optional analytics |

Vendos placeholder-a si `replace-me`, jo credential-e reale. `server/_core/env.ts` është burimi autoritar për variables e përdorura në runtime.

## Self-hosted profile

Për një instalim të pavarur vendos `AUTH_PROVIDER=local`, `VITE_AUTH_PROVIDER=local` dhe `STORAGE_PROVIDER=local`. `LOCAL_STORAGE_DIR` përcakton direktorine e skedarëve dhe duhet të jetë volume persistent në Docker. `LOCAL_AUTH_USERS_JSON` është një array JSON me përdoruesit lokalë dhe vetëm hash-e scrypt, jo password-a plaintext:

```json
[{"email":"admin@example.com","name":"Administrator","role":"admin","passwordHash":"scrypt$<salt>$<derived-key>"}]
```

Hash-i krijohet me `hashLocalPassword` ose me utility-n e dokumentuar; mos e vendos password-in real në Git. Login-i self-hosted është `/login`, endpoint-i është `POST /api/local-auth/login`, ndërsa storage-i përdor `/local-storage/*`. Profili `manus` mbetet default dhe ruan OAuth/Forge/S3 për instalimet ekzistuese.

## S3-compatible storage

Për storage cloud pa Forge përdor `STORAGE_PROVIDER=s3`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` dhe opsionalisht `S3_ENDPOINT` për MinIO ose një endpoint tjetër S3-compatible. Për AWS lëre `S3_ENDPOINT` bosh; për MinIO përdor `S3_ENDPOINT=http://minio:9000` dhe `S3_FORCE_PATH_STYLE=true`. Upload përdor `PutObject`, download përdor URL të nënshkruar 15-minutësh dhe endpoint-i publik është `/s3-storage/*`.

`GET /healthz` kthen sukses vetëm kur konfigurimi i database është i disponueshëm; Docker e përdor për readiness/healthcheck.
