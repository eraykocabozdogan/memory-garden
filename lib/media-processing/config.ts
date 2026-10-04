import "server-only";

export type MediaProcessingConfig = {
  appBaseUrl: string;
  googleCloudProjectId: string;
  googleCloudRegion: string;
  googleCloudJobName: string;
  googleCloudContainerName: string;
  tokenSecret: string;
};

export type GoogleCloudWorkloadIdentityConfig = {
  projectNumber: string;
  serviceAccountEmail: string;
  workloadIdentityPoolId: string;
  workloadIdentityProviderId: string;
};

export function getMediaProcessingConfig(): MediaProcessingConfig {
  const config = {
    appBaseUrl: process.env.APP_BASE_URL,
    googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    googleCloudRegion: process.env.GOOGLE_CLOUD_REGION,
    googleCloudJobName: process.env.GOOGLE_CLOUD_MEDIA_JOB_NAME,
    googleCloudContainerName: process.env.GOOGLE_CLOUD_MEDIA_CONTAINER_NAME,
    tokenSecret: process.env.MEDIA_PROCESSING_TOKEN_SECRET,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Media processing configuration is missing: ${missing.join(", ")}`);
  }

  return {
    ...(config as Record<keyof typeof config, string>),
    appBaseUrl: config.appBaseUrl!.replace(/\/$/, ""),
  };
}

export function getGoogleCloudWorkloadIdentityConfig(): GoogleCloudWorkloadIdentityConfig {
  const config = {
    projectNumber: process.env.GOOGLE_CLOUD_PROJECT_NUMBER,
    serviceAccountEmail: process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_EMAIL,
    workloadIdentityPoolId: process.env.GOOGLE_CLOUD_WORKLOAD_IDENTITY_POOL_ID,
    workloadIdentityProviderId: process.env.GOOGLE_CLOUD_WORKLOAD_IDENTITY_PROVIDER_ID,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Google Cloud workload identity configuration is missing: ${missing.join(", ")}`,
    );
  }

  return config as Record<keyof typeof config, string>;
}
