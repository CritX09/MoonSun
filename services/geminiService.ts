import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AutomationScript } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Generates an automation script based on user requirements for Sunshine/Moonlight.
 */
export const generateAutomationScript = async (
  intent: string,
  os: string
): Promise<AutomationScript> => {
  const prompt = `
    Tu es un expert en configuration de streaming de jeux pour Sunshine (Host) et Moonlight (Client).
    L'utilisateur veut automatiser une tâche sur son hôte de streaming.
    
    OS de l'hôte: ${os}
    Demande utilisateur: "${intent}"
    
    Instructions Techniques :
    1. **Variables d'environnement Sunshine** : Utilise %SUNSHINE_CLIENT_NAME% (Batch), $env:SUNSHINE_CLIENT_NAME (PowerShell) ou $SUNSHINE_CLIENT_NAME (Bash) pour identifier l'appareil.
    2. **Non-bloquant** : Les commandes (sleep, timeout) DOIVENT être détachées (Start-Process -NoNewWindow, start /b, &).
    3. **Mode 'Couper Accès' / 'Déconnecter'** : 
       - Si l'utilisateur demande de "couper l'accès", "déconnecter" ou "fin de session" SANS éteindre le PC :
       - Sous Windows, utilise impérativement : 'shutdown /l' (Logoff) OU 'tsdiscon' (Disconnect Session).
       - NE PAS utiliser 'shutdown /s' (arrêt complet) sauf si explicitement demandé.
       - L'objectif est de renvoyer l'utilisateur à l'écran de connexion Windows, ce qui coupe le stream Moonlight instantanément.
    4. **Format JSON** : Réponds UNIQUEMENT avec du JSON brut. Pas de markdown, pas de blabla.
    
    Structure JSON attendue :
    {
      "title": "Titre court",
      "description": "Description courte",
      "language": "powershell" | "batch" | "bash",
      "code": "Le code complet ici"
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let text = response.text;
    if (!text) throw new Error("Pas de réponse de Gemini");
    
    // NETTOYAGE CRITIQUE : Enlève les balises markdown ```json et ``` qui font souvent planter le parsing
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as AutomationScript;
  } catch (error) {
    console.error("Erreur Gemini Script:", error);
    return {
      title: "Erreur de génération",
      description: "L'IA n'a pas pu générer un script valide. Veuillez réessayer.",
      language: "bash",
      code: "REM Erreur de parsing ou de connexion.\nREM Veuillez réessayer.",
    };
  }
};

/**
 * Chat with the assistant for troubleshooting or optimization.
 */
export const chatWithAssistant = async (
  history: { role: string; text: string }[],
  newMessage: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "Tu es 'Lumina', un assistant IA expert en streaming Moonlight/Sunshine. Tu aides l'utilisateur à configurer ses scripts 'Do Command' et 'Undo Command'. Tu es bref, précis et technique.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Désolé, je n'ai pas compris.";
  } catch (error) {
    console.error("Erreur Gemini Chat:", error);
    return "Une erreur est survenue lors de la communication avec l'IA.";
  }
};
