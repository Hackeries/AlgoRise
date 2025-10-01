import crypto from "crypto";

/**
 * Codeforces API utility with authentication
 * Uses API key and secret for authenticated requests
 */

interface CFApiResponse<T = any> {
  status: "OK" | "FAILED";
  comment?: string;
  result?: T;
}

export interface CodeforcesUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  registrationTimeSeconds: number;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
}

// --- Authenticated URL generator ---
function generateAuthenticatedUrl(
  method: string,
  params: Record<string, string> = {}
): string {
  const apiKey = process.env.CODEFORCES_API_KEY;
  const apiSecret = process.env.CODEFORCES_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn("Codeforces API credentials not configured, using public API");
    const queryParams = new URLSearchParams(params);
    return `https://codeforces.com/api/${method}?${queryParams}`;
  }

  const time = Math.floor(Date.now() / 1000);

  const allParams: Record<string, string> = {
    ...params,
    apiKey,
    time: time.toString(),
  };

  const sortedParams = Object.keys(allParams)
    .sort()
    .map((key) => `${key}=${allParams[key]}`)
    .join("&");

  const rand = crypto.randomBytes(6).toString("hex");
  const toSign = `${rand}/${method}?${sortedParams}#${apiSecret}`;
  const signature = crypto.createHash("sha512").update(toSign).digest("hex");

  const finalParams = new URLSearchParams({
    ...allParams,
    apiSig: `${rand}${signature}`,
  });

  return `https://codeforces.com/api/${method}?${finalParams}`;
}

// --- Generic request ---
export async function cfApiRequest<T = any>(
  method: string,
  params: Record<string, string> = {}
): Promise<CFApiResponse<T>> {
  const url = generateAuthenticatedUrl(method, params);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "AlgoRise/1.0" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as CFApiResponse<T>;
  } catch (error) {
    console.error(`Codeforces API error for ${method}:`, error);
    return {
      status: "FAILED",
      comment: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Specific endpoints ---
export async function cfGetUserInfo(
  handles: string
): Promise<CFApiResponse<CodeforcesUser[]>> {
  const url = `https://codeforces.com/api/user.info?handles=${handles}`;
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "AlgoRise/1.0" },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return (await response.json()) as CFApiResponse<CodeforcesUser[]>;
  } catch (error) {
    console.error(`Codeforces user.info API error for ${handles}:`, error);
    return {
      status: "FAILED",
      comment: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// --- Batch user ratings ---
export async function getUserRatings(
  handles: string[]
): Promise<
  Record<string, { rating: number; maxRating: number; rank: string }>
> {
  const ratings: Record<
    string,
    { rating: number; maxRating: number; rank: string }
  > = {};

  const batchSize = 10;
  for (let i = 0; i < handles.length; i += batchSize) {
    const batch = handles.slice(i, i + batchSize);

    try {
      const response = await cfGetUserInfo(batch.join(","));
      if (response.status === "OK" && response.result) {
        response.result.forEach((user) => {
          ratings[user.handle] = {
            rating: user.rating ?? 1200,
            maxRating: user.maxRating ?? 1200,
            rank: user.rank ?? "Unrated",
          };
        });
      }
    } catch (err) {
      console.error(`Batch failed for handles: ${batch.join(",")}`, err);
      batch.forEach((h) => {
        ratings[h] = { rating: 1200, maxRating: 1200, rank: "Unrated" };
      });
    }
  }

  return ratings;
}
