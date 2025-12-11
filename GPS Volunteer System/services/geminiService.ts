import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImpactMessage = async (userName: string, totalHours: number): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Keep up the great work! Your contribution makes a difference.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Write a short, inspiring, and cheerful message (max 2 sentences) for a volunteer named ${userName} who has contributed ${totalHours} hours to "Gifted People Services".
        The tone should be appreciative and focus on the positive impact on the community.
        Do not use markdown.
      `,
    });
    return response.text || "You are making a huge difference!";
  } catch (error) {
    console.error("Error generating impact message:", error);
    return "Your dedication lights up our community. Thank you for your service!";
  }
};