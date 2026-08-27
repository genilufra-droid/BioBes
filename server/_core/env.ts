export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  storageProvider: process.env.STORAGE_PROVIDER ?? "manus",
  localStorageDir: process.env.LOCAL_STORAGE_DIR ?? "./storage-data",
  // Local accounts are the normal authentication path. Set AUTH_PROVIDER=manus
  // only when deliberately enabling the legacy OAuth compatibility adapter.
  authProvider: process.env.AUTH_PROVIDER ?? "local",
  localAuthUsersJson: process.env.LOCAL_AUTH_USERS_JSON ?? "[]",
  localAuthSetupSecret: process.env.LOCAL_AUTH_SETUP_SECRET ?? "",
  s3Endpoint: process.env.S3_ENDPOINT ?? undefined,
  s3Region: process.env.S3_REGION ?? "us-east-1",
  s3Bucket: process.env.S3_BUCKET ?? "biobes",
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
};
