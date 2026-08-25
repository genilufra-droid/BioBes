import { randomBytes, scryptSync } from "node:crypto";
const password = process.argv[2];
if (!password) { console.error("Usage: node scripts/hash_local_password.mjs '<password>'"); process.exit(2); }
const salt = randomBytes(16).toString("hex");
const key = scryptSync(password, salt, 64).toString("hex");
console.log(`scrypt$${salt}$${key}`);
