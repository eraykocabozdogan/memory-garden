import "server-only";

import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient, GoogleAuth } from "google-auth-library";

import {
  getGoogleCloudWorkloadIdentityConfig,
  getMediaProcessingConfig,
} from "./config";
import { createProcessingToken } from "./token";

const TOKEN_LIFETIME_MS = 48 * 60 * 60 * 1000;
const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

async function getCloudRunRequestHeaders() {
  if (process.env.VERCEL === "1") {
    const config = getGoogleCloudWorkloadIdentityConfig();
    const audience =
      `//iam.googleapis.com/projects/${config.projectNumber}` +
      `/locations/global/workloadIdentityPools/${config.workloadIdentityPoolId}` +
      `/providers/${config.workloadIdentityProviderId}`;
    const client = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url:
        "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/" +
        `${config.serviceAccountEmail}:generateAccessToken`,
      scopes: [CLOUD_PLATFORM_SCOPE],
      subject_token_supplier: {
        getSubjectToken: () => getVercelOidcToken(),
      },
    });

    if (!client) throw new Error("Google Cloud workload identity client could not be created.");
    return client.getRequestHeaders();
  }

  const auth = new GoogleAuth({ scopes: [CLOUD_PLATFORM_SCOPE] });
  const client = await auth.getClient();
  return client.getRequestHeaders();
}

export async function startMediaProcessingJob(itemId: string, runId: string) {
  const config = getMediaProcessingConfig();
  const jobName = `projects/${config.googleCloudProjectId}/locations/${config.googleCloudRegion}/jobs/${config.googleCloudJobName}`;
  const endpoint = `https://run.googleapis.com/v2/${jobName}:run`;
  const token = createProcessingToken({
    version: 1,
    itemId,
    runId,
    expiresAt: Date.now() + TOKEN_LIFETIME_MS,
  });
  const headers = new Headers(await getCloudRunRequestHeaders());
  headers.set("content-type", "application/json");
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      overrides: {
        containerOverrides: [
          {
            name: config.googleCloudContainerName,
            env: [
              { name: "MEDIA_JOB_TOKEN", value: token },
              {
                name: "MEDIA_PROCESSING_API_URL",
                value: `${config.appBaseUrl}/api/internal/media-processing`,
              },
            ],
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Cloud Run job could not be started (${response.status}).`);
  }
}
