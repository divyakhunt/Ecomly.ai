// src/services/removeBgService.ts

/**
 * Reads a comma-separated list of API keys from the .env file.
 * Example .env entry: VITE_BG_REMOVE_API_KEYS=key1,key2,key3
 */
const apiKeysRaw = import.meta.env.VITE_BG_REMOVE_API_KEYS;
const apiKeys = apiKeysRaw?.split(",").map(k => k.trim()).filter(k => k) ?? [];

console.log(`Found ${apiKeys.length} Remove.bg API keys.`);

export const removeBgService = {
  /**
   * Removes the background from an image file by trying a list of API keys in sequence.
   * If a key fails due to quota or rate limits, it automatically tries the next one.
   * @param file The image file (e.g., from an <input type="file">).
   * @returns A Promise that resolves with a Blob of the background-removed image.
   * @throws An error if all API keys fail or if a non-quota-related error occurs.
   */
  removeImageBackground: async (file: File): Promise<Blob> => {
    // First, check if any keys were provided at all.
    if (apiKeys.length === 0) {
      throw new Error("No Remove.bg API keys were found. Please check your .env file for VITE_BG_REMOVE_API_KEYS.");
    }

    // Loop through each API key.
    for (const apiKey of apiKeys) {
      const formData = new FormData();
      formData.append("image_file", file);
      formData.append("size", "auto");

      try {
        console.log(`Attempting to use API key ending in ...${apiKey.slice(-4)}`);
        const res = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": apiKey,
          },
          body: formData,
        });

        // If the response is successful (e.g., status 200), we're done!
        if (res.ok) {
          console.log(`✅ Success with key ...${apiKey.slice(-4)}`);
          return await res.blob(); // Return the image blob and exit the function.
        }

        // If the response was an error, figure out why.
        const errorText = await res.text();
        console.warn(`Key ...${apiKey.slice(-4)} failed with status ${res.status}: ${errorText}`);

        // Check for specific errors that mean we should try the next key.
        // 402: Payment Required (Quota Exceeded)
        // 429: Too Many Requests (Rate Limit)
        if (
          res.status === 402 ||
          res.status === 429 ||
          errorText.toLowerCase().includes("quota") ||
          errorText.toLowerCase().includes("limit")
        ) {
          console.log("Quota/limit error. Trying next key...");
          continue; // Move to the next iteration of the loop.
        }

        // For any other kind of error (e.g., invalid key), stop immediately.
        throw new Error(`Remove.bg API Error: ${errorText}`);

      } catch (err) {
        // This catches network errors or errors from the 'throw' statement above.
        console.error(`An error occurred with key ...${apiKey.slice(-4)}:`, err);

        // If it was a non-quota API error, we should not continue.
        if (err instanceof Error && err.message.startsWith("Remove.bg API Error:")) {
          throw err;
        }

        // For network errors, try the next key.
        console.log("Network or unknown error. Trying next key...");
        continue;
      }
    }

    // If the loop finishes without returning, it means all keys failed.
    throw new Error("All Remove.bg API keys failed or their quotas have been exceeded.");
  },
};