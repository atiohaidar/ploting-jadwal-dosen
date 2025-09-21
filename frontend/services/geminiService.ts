
import { GoogleGenAI, Type } from "@google/genai";
import type { DesignGuide } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const designGuideSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: {
      type: Type.STRING,
      description: "A creative and fitting name for the project based on its description."
    },
    palette: {
      type: Type.ARRAY,
      description: "An array of 5-6 complementary colors for the brand palette.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "e.g., 'Primary Background', 'Accent', 'Text Color'" },
          hex: { type: Type.STRING, description: "The hexadecimal color code, e.g., '#FFFFFF'" },
          description: { type: Type.STRING, description: "A brief description of the color's intended use." }
        },
        required: ["name", "hex", "description"]
      }
    },
    typography: {
      type: Type.OBJECT,
      properties: {
        heading: {
          type: Type.OBJECT,
          properties: {
            fontFamily: { type: Type.STRING, description: "A suitable Google Font for headings (e.g., 'Poppins')." },
            fontWeight: { type: Type.STRING, description: "e.g., '700', 'Bold'" },
            description: { type: Type.STRING, description: "Usage guidelines for headings." }
          },
          required: ["fontFamily", "fontWeight", "description"]
        },
        body: {
          type: Type.OBJECT,
          properties: {
            fontFamily: { type: Type.STRING, description: "A readable Google Font for body text (e.g., 'Inter')." },
            fontWeight: { type: Type.STRING, description: "e.g., '400', 'Regular'" },
            description: { type: Type.STRING, description: "Usage guidelines for body text." }
          },
          required: ["fontFamily", "fontWeight", "description"]
        },
        code: {
          type: Type.OBJECT,
          properties: {
            fontFamily: { type: Type.STRING, description: "A monospaced Google Font for code snippets (e.g., 'Fira Code')." },
            fontWeight: { type: Type.STRING, description: "e.g., '400', 'Regular'" },
            description: { type: Type.STRING, description: "Usage guidelines for code snippets." }
          },
          required: ["fontFamily", "fontWeight", "description"]
        }
      },
      required: ["heading", "body", "code"]
    },
    iconography: {
      type: Type.STRING,
      description: "A description of the recommended icon style (e.g., 'Minimalist, outline, 2px stroke')."
    },
    layout: {
      type: Type.STRING,
      description: "Principles for layout and spacing (e.g., 'Use an 8px grid system, with ample white space')."
    },
    logoConcept: {
      type: Type.STRING,
      description: "A creative concept for a logo that fits the brand identity."
    }
  },
  required: ["projectName", "palette", "typography", "iconography", "layout", "logoConcept"]
};

export const generateDesignGuide = async (projectDescription: string): Promise<DesignGuide> => {
  const prompt = `
    Generate a comprehensive design guide for the following project. Ensure the output is a valid JSON object that adheres to the provided schema.

    Project Description:
    ---
    ${projectDescription}
    ---

    The design guide should include a suitable color palette (with hex codes), typography rules (using Google Fonts), iconography style, layout principles, and a logo concept. The tone should be modern, clean, professional, and tech-oriented. Make the color palette consistent with the requested theme if mentioned, otherwise create a fitting one.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: designGuideSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    return parsedData as DesignGuide;

  } catch (error) {
    console.error("Error generating design guide:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate design guide from AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the design guide.");
  }
};
