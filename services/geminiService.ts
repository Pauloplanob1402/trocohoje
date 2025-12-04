import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Note: In a real production app, ensure API_KEY is handled securely.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const enhanceListing = async (title: string, type: 'OFFER' | 'REQUEST'): Promise<{ description: string; suggestedCredits: number }> => {
  if (!process.env.API_KEY) {
    return {
      description: "Descrição gerada automaticamente indisponível (falta chave API).",
      suggestedCredits: 10
    };
  }

  try {
    const prompt = `
      Você é um assistente do app "TROCOHOJE", um marketplace de trocas rápidas.
      O usuário quer ${type === 'OFFER' ? 'oferecer' : 'pedir'}: "${title}".
      
      Gere um JSON com:
      1. Uma descrição curta, divertida e viciante (máximo 150 caracteres) para atrair trocas.
      2. Um valor sugerido em créditos (de 5 a 100) baseado na utilidade/raridade.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            suggestedCredits: { type: Type.INTEGER }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      description: json.description || `Uma ótima oportunidade de ${title}!`,
      suggestedCredits: json.suggestedCredits || 15
    };

  } catch (error) {
    console.error("Gemini optimization failed:", error);
    return {
      description: `Estou interessado em negociar ${title}. Vamos conversar!`,
      suggestedCredits: 10
    };
  }
};