
import { GoogleGenAI, Type, GenerateContentResponse, GenerateImagesResponse } from "@google/genai";
import type { Chat } from "@google/genai";

const handleApiError = (error: unknown, context: string): never => {
    console.error(`Gemini API Error in ${context}:`, error);
    if (error instanceof Error) {
        let message = `An error occurred in ${context}. Please try again. Details: ${error.message}`;
        if (error.message.includes('API key not valid')) {
            message = 'The API key is invalid. Please check your configuration.';
        } else if (error.message.toLowerCase().includes('quota')) {
            message = 'You have exceeded your API quota. Please check your plan and billing details.';
        } else if (error.message.includes('503') || error.message.toLowerCase().includes('overloaded')) {
            message = 'The AI model is currently overloaded and could not respond after several attempts. Please try again in a few minutes.';
        }
        throw new Error(message);
    }
    throw new Error(`An unknown error occurred while communicating with the AI in ${context}.`);
};

// A utility function to retry API calls with exponential backoff
const withRetry = async <T>(apiCall: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await apiCall();
        } catch (error: any) {
            lastError = error;
            // Check for status code 503 or "overloaded" message which indicates a transient server issue.
            const isRetryable = error.message && (error.message.includes('503') || error.message.toLowerCase().includes('overloaded'));

            if (isRetryable && i < retries - 1) {
                const waitTime = delay * Math.pow(2, i); // Exponential backoff
                console.warn(`API call failed with retryable error. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(res => setTimeout(res, waitTime));
            } else {
                // If the error is not retryable or we've exhausted retries, throw it.
                throw error;
            }
        }
    }
    // This part should not be reachable if the loop logic is correct, but as a fallback:
    throw lastError;
};

// Utility to robustly extract JSON from a string that may be wrapped in markdown.
const extractJson = (text: string): any => {
    // This regex looks for a JSON block inside ```json ... ``` or a standalone JSON object/array.
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*}|\[[\s\S]*\])/);
    if (!jsonMatch) {
        throw new Error("Could not find a valid JSON object in the response.");
    }
    // Prioritize the content within ```json ... ``` (group 1), otherwise use the standalone object/array (group 2).
    const jsonString = jsonMatch[1] || jsonMatch[2];
    if (!jsonString) {
      throw new Error("Could not extract JSON content from the response.");
    }
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse extracted JSON string:", jsonString, e);
        throw new Error("Found a JSON-like structure, but it was malformed.");
    }
};

// Use a closure to ensure the AI instance is a true singleton, initialized only when first needed.
const createGeminiService = () => {
    let ai: GoogleGenAI | null = null;
    const API_KEY = process.env.API_KEY;

    const getAi = (): GoogleGenAI => {
        if (ai) {
            return ai;
        }
        if (!API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        ai = new GoogleGenAI({ apiKey: API_KEY });
        return ai;
    };

    // --- CHATBOT SERVICE ---
    const startChat = (systemInstruction: string): Chat => {
        try {
            return getAi().chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                },
            });
        } catch(error) {
            handleApiError(error, 'startChat');
        }
    };


    // --- PRODUCT SUMMARY SERVICE ---
    const generateProductSummary = async (base64Image: string, mimeType: string) => {
        const productSchema = {
            type: Type.OBJECT,
            properties: {
                title: {
                    type: Type.STRING,
                    description: "A catchy, SEO-friendly title for the product, under 60 characters."
                },
                description: {
                    type: Type.STRING,
                    description: "A compelling 2-3 sentence product description highlighting key features and benefits."
                },
                hashtags: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    },
                    description: "An array of 5-7 relevant, trending hashtags for social media, without the '#' symbol."
                }
            },
            required: ["title", "description", "hashtags"]
        };

        const imagePart = {
            inlineData: { data: base64Image, mimeType }
        };

        const textPart = {
            text: "Analyze this product image. Based on the visual information, generate a product title, description, and hashtags according to the provided schema. The tone should be for e-commerce marketing."
        };
        
        const apiCall = () => getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: productSchema
            }
        });

        try {
            const response: GenerateContentResponse = await withRetry(apiCall);
            const result = extractJson(response.text);
            return result;
        } catch (error) {
            handleApiError(error, 'generateProductSummary');
        }
    };

    // --- IMAGE GENERATOR SERVICE ---
    // curruntly not using this service, but keeping it for future use.
    const generateImage = async (prompt: string): Promise<string> => {
        const apiCall = () => getAi().models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        try {
            const response: GenerateImagesResponse = await withRetry(apiCall);

            const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;

            if (!imageBytes) {
                console.error("API response did not contain image data:", response);
                throw new Error("The AI failed to generate an image. The response was empty.");
            }
            
            return `data:image/png;base64,${imageBytes}`;
        } catch (error) {
            handleApiError(error, 'generateImage');
        }
    };

    // --- MAKE MY BRAND SERVICE ---
    const generateBrandedProduct = async (logoBase64: string, logoMimeType: string, productPrompt: string): Promise<string> => {
        // Step 1: Use gemini-2.5-flash to get a description of the logo.
        const logoDescriptionPrompt = {
            text: "You are a logo analyst. In a single, concise phrase, describe the key visual elements of this logo for an image generation AI. Focus on shapes, main symbols, and colors. For example: 'a minimalist green leaf inside a grey circle' or 'the letters AI in a futuristic blue font'."
        };
        const logoImagePart = { inlineData: { data: logoBase64, mimeType: logoMimeType } };

        const descriptionApiCall = () => getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [logoImagePart, logoDescriptionPrompt] },
            config: {
                temperature: 0.2, // Lower temperature for more factual, less creative description.
            }
        });
        
        let logoDescription = '';
        try {
            const response: GenerateContentResponse = await withRetry(descriptionApiCall);
            logoDescription = response.text.trim();
            if (!logoDescription) {
                throw new Error("AI failed to generate a description for the uploaded logo.");
            }
        } catch (error) {
            // Rethrow the error with more context
            return handleApiError(error, 'generateBrandedProduct (Logo Description Step)');
        }

        // Step 2: Use the description to generate a new image with imagen-3.0-generate-002.
        const finalImagePrompt = `Create a photorealistic product mockup of: "${productPrompt}".
This product must feature a logo on it. The logo is described as: "${logoDescription}".
The logo should be placed naturally and seamlessly on the product, respecting its shape, perspective, lighting, and material. The final image should be high-quality with a clean, professional background.`;
        
        // The existing `generateImage` function calls the correct model and returns a full data URL.
        try {
            // It already handles retries and errors, so we can call it directly.
            return await generateImage(finalImagePrompt);
        } catch (error) {
            // Rethrow the error with more context
            return handleApiError(error, 'generateBrandedProduct (Image Generation Step)');
        }
    };

    // --- BACKGROUND REMOVER SERVICE ---
    const removeImageBackground = async (base64Image: string, mimeType: string): Promise<string> => {
        const imagePart = { inlineData: { data: base64Image, mimeType } };

        const textPart = {
            text: `Your task is to create a high-quality alpha mask to isolate the main foreground subject in the provided image.

            Instructions:
            1.  Analyze the image to identify the primary subject.
            2.  Generate a PNG image that will serve as an alpha mask.
            3.  The mask MUST have a transparent background (alpha channel is zero).
            4.  The identified foreground subject MUST be solid white (RGB: 255, 255, 255) with full opacity (alpha channel is 255).
            5.  The output MUST be ONLY the raw base64 encoded string of this PNG mask.
            6.  Do NOT include the "data:image/png;base64," prefix.
            7.  Do NOT wrap the output in JSON, markdown, or any other formatting.`
        };

        const apiCall = () => getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                // A lower temperature ensures the model follows the precise instructions more strictly.
                temperature: 0.1,
            }
        });

        try {
            const response: GenerateContentResponse = await withRetry(apiCall);
            const base64Mask = response.text.trim();

            // Perform a basic validation to ensure the response is a plausible base64 string.
            if (!base64Mask || /[^A-Za-z0-9+/=]/.test(base64Mask)) {
                 console.error("AI returned an invalid base64 string:", base64Mask);
                 throw new Error("The AI returned an invalid or empty response for the image mask.");
            }
            
            return base64Mask;
        } catch (error) {
            handleApiError(error, 'removeImageBackground');
        }
    };
    
    return {
        startChat,
        generateProductSummary,
        generateImage,
        generateBrandedProduct,
        removeImageBackground,
    };
};


export const geminiService = createGeminiService();
