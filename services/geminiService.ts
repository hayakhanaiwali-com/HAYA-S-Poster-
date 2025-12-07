import { GoogleGenAI, Type } from "@google/genai";
import { PosterConfig, PosterFont, PosterLayout } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTextForPoster = async (text: string): Promise<PosterConfig> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the following text to design a visual poster: "${text}".
    Determine the mood, a highly descriptive prompt for a background image (abstract, textural, or scenic, but NO TEXT in the image), a color palette, a font style, and a layout composition.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          imagePrompt: {
            type: Type.STRING,
            description: "A detailed prompt for an image generation model to create a background. Specify style (e.g., minimalist, grunge, oil painting, neon 3D). Explicitly state 'no text' in the prompt.",
          },
          moodDescription: {
            type: Type.STRING,
            description: "A short description of the mood (e.g., 'Energetic and bold' or 'Calm and serene').",
          },
          colorPalette: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING, description: "Hex code for dominant color" },
              secondary: { type: Type.STRING, description: "Hex code for secondary color" },
              accent: { type: Type.STRING, description: "Hex code for accent color" },
              text: { type: Type.STRING, description: "Hex code for text color, ensuring high contrast with primary/secondary" },
            },
            required: ["primary", "secondary", "accent", "text"],
          },
          fontStyle: {
            type: Type.STRING,
            enum: [
              PosterFont.MODERN,
              PosterFont.DISPLAY,
              PosterFont.SERIF,
              PosterFont.HANDWRITTEN,
              PosterFont.CLASSIC
            ],
            description: "The most appropriate typography style.",
          },
          layout: {
            type: Type.STRING,
            enum: [
              PosterLayout.CENTERED,
              PosterLayout.BOTTOM_HEAVY,
              PosterLayout.TOP_HEAVY,
              PosterLayout.SPLIT
            ],
            description: "The best text layout composition.",
          },
        },
        required: ["imagePrompt", "colorPalette", "fontStyle", "layout", "moodDescription"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to analyze text.");
  }

  return JSON.parse(response.text) as PosterConfig;
};

export const generatePosterBackground = async (prompt: string): Promise<string> => {
  // Using gemini-2.5-flash-image for standard generation.
  // For higher quality, we could switch to gemini-3-pro-image-preview if available and keys allow.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt + ", high quality, 4k, digital art, wallpaper style, no text, masterpiece" }
      ]
    },
    config: {
        // No responseMimeType for image models usually, but let's be safe and defaults work well.
    }
  });

  // Iterate to find the image part
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated.");
};