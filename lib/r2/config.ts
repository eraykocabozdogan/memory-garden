import "server-only";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  jurisdiction: "eu";
  uploadTokenSecret: string;
};

export function getR2Config(): R2Config {
  const config = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    jurisdiction: process.env.R2_JURISDICTION,
    uploadTokenSecret: process.env.UPLOAD_TOKEN_SECRET,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`R2 configuration is missing: ${missing.join(", ")}`);
  }

  if (config.jurisdiction !== "eu") {
    throw new Error("R2_JURISDICTION must be eu.");
  }

  return config as R2Config;
}
