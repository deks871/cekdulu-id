import { GoogleGenAI } from "@google/genai";

export interface GeminiAnalysisResult {
  risk_score: number;
  risk_level: "AMAN" | "PERLU DIWASPADAI" | "KEMUNGKINAN PENIPUAN";
  indicators: string[];
  reasoning: string[];
}

export async function evaluateWithGemini(text: string): Promise<GeminiAnalysisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI analysis layer.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Analyze this message. Do not focus primarily on keywords. 
Evaluate:
1. Sender intent
2. Social engineering indicators
3. Impersonation attempts
4. Manipulation techniques
5. Information gathering behavior
6. Trust-building tactics
7. Urgency tactics
8. Reward exploitation
9. Risk level

Message:
"${text}"

Return exactly one valid JSON object (no markdown, no backticks) with the following schema:
{
  "risk_score": number (0-100),
  "risk_level": "AMAN" | "PERLU DIWASPADAI" | "KEMUNGKINAN PENIPUAN",
  "indicators": string[] (brief phrases of detected patterns),
  "reasoning": string[] (explanations of WHY it is suspicious based on intent)
}`;

    const fetchPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    // 10 second timeout for Gemini API
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini API timeout exceeded 10s")), 10000);
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    const responseText = response.text || "";
    
    // Clean up potential markdown blocks if the model ignores the instruction
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const result = JSON.parse(cleanedText) as GeminiAnalysisResult;
    
    // Validate output structure
    if (typeof result.risk_score === "number" && Array.isArray(result.reasoning)) {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}
