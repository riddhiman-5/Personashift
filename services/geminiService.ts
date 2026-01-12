
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async refineUserInput(professions: string, context: string): Promise<{ refinedProfessions: string[]; refinedContext: string }> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user provided the following professions: "${professions}" and context: "${context}". 
      1. Correct any spelling mistakes.
      2. Translate to proper, professional English if needed.
      3. If the user provided fewer than 10 professions, suggest related interesting ones to make a total of exactly 10.
      4. Refine the context into a single descriptive paragraph for a high-end commercial photographer.
      
      Return a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedProfessions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of exactly 10 professional fields."
            },
            refinedContext: { type: Type.STRING }
          },
          required: ["refinedProfessions", "refinedContext"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async generatePersonaImage(baseImageBase64: string, field: string, customContext: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: baseImageBase64.split(',')[1],
              mimeType: 'image/png',
            },
          },
          {
            text: `Generate a hyper-realistic, professional commercial photograph of this person as a ${field}.
            STYLE: Authentic 8k resolution portrait, shot on 85mm lens, f/1.8 aperture. Cinematic natural lighting.
            REALISM: High-fidelity skin textures, realistic hair, no "AI-smoothing" or "filtered" look. It must look like a real, raw photograph.
            FRAMING: Medium shot, centered. Ensure the full head, hair, and shoulders are perfectly in frame. 
            CONTEXT: ${customContext}. 
            CRITICAL: Maintain the exact facial structure and identity of the person in the source image. Change only the attire and the background environment to suit a ${field} setting.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image returned from Gemini');
  }

  async generatePersonaDetails(field: string, customContext: string): Promise<{ title: string; bio: string; skills: string[]; personality: string }> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a professional persona for the job field: "${field}". 
      Consider this additional context: "${customContext}".
      Provide a catchy professional title, a short 2-sentence bio, 3 specific skills, and a one-word personality trait.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            bio: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            personality: { type: Type.STRING }
          },
          required: ["title", "bio", "skills", "personality"]
        }
      }
    });

    return JSON.parse(response.text);
  }
}
