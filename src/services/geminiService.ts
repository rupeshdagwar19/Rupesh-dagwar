import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language } from "../translations";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  return new GoogleGenAI({ apiKey });
};

export const analyzeCropDisease = async (imageBase64: string, language: Language): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    As a world-class Plant Pathologist and Agricultural Scientist, analyze this image with extreme precision.
    
    1. **Identify the Crop**: Specify the common and scientific name if possible.
    2. **Detailed Diagnosis**: 
       - Identify the specific disease, pest, or nutrient deficiency.
       - Describe the visual symptoms observed (e.g., chlorosis, necrotic spots, mycelium growth, wilting patterns).
       - Determine the likely pathogen (fungal, bacterial, viral) or environmental cause.
    3. **Actionable Treatment Plan**:
       - Provide immediate steps to stop the spread.
       - Suggest specific organic remedies (e.g., neem oil, copper fungicides, biological controls).
       - Suggest chemical options only if necessary, with safety precautions.
    4. **Preventive Measures**: How to avoid this in the future (e.g., crop rotation, soil health, moisture control).
    5. **Fertilizer/Nutrient Advice**: Specific recommendations based on the plant's current state.
    
    Provide the response in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    
    Format the response with clear, professional headings:
    - **Crop Identification**
    - **Diagnosis & Symptoms**
    - **Treatment Plan (Immediate Actions)**
    - **Organic & Chemical Solutions**
    - **Prevention & Long-term Care**
  `;

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBase64.split(',')[1],
    },
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      systemInstruction: "You are a highly accurate AI Agricultural Expert. Your goal is to provide precise, scientific, and actionable advice to farmers to save their crops. Be thorough and professional.",
    }
  });

  return response.text || "Could not analyze image. Please ensure the plant is clearly visible and well-lit.";
};

export const getFarmingTips = async (location: { lat: number, lng: number } | null, language: Language, profile?: any): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const locationContext = location 
    ? `The user is at latitude ${location.lat} and longitude ${location.lng}.`
    : "The user's location is unknown, provide general seasonal tips for India.";

  const cropContext = profile?.crops?.length > 0
    ? `The user is currently growing: ${profile.crops.map((c: any) => `${c.name} (${c.type})`).join(', ')}.`
    : "The user hasn't specified any crops yet.";

  const prompt = `
    You are an expert agricultural advisor. 
    ${locationContext}
    ${cropContext}
    Based on the current date (${new Date().toLocaleDateString()}) and typical weather patterns for this region/season:
    1. Provide 3-5 actionable farming tips (e.g., irrigation, pest control, sowing).
    2. Suggest which crops are best to plant or maintain right now.
    3. Provide the response in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    
    Format the response as a list of tips.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text || "Could not fetch tips.";
};

export const getAISuggestion = async (query: string, language: Language, profile?: any): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const profileContext = profile ? `
    User Profile Information:
    - Name: ${profile.name}
    - Location: ${profile.farmLocation}
    - Crops Grown: ${profile.crops?.map((c: any) => `${c.name} (${c.type})`).join(', ') || 'None specified'}
    - Preferences: ${profile.preferences?.organic ? 'Prefers organic farming' : 'No specific preference'}
    
    Use this information to provide personalized advice.
  ` : '';

  const prompt = `
    You are an elite AI Agricultural Consultant and Plant Pathologist. 
    ${profileContext}
    The user is asking: "${query}"
    
    Provide a highly accurate, scientific, and practical response in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    
    If the user is describing plant symptoms:
    1. **Diagnose**: Identify the most likely disease, pest, or deficiency.
    2. **Explain**: Briefly explain why you made this diagnosis based on the symptoms.
    3. **Remedy**: Provide a step-by-step treatment plan (prioritize organic/biological methods, but include chemical ones if critical).
    4. **Prevention**: Suggest how to prevent recurrence.
    
    If the query is general:
    - Provide actionable farming best practices.
    - Be concise but thorough.
    
    Format the response using Markdown for readability.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: "You are the world's leading AI Agricultural Expert. Your mission is to help farmers achieve maximum yield and healthy crops through precise, scientific, and actionable advice. You specialize in plant pathology and sustainable farming.",
    }
  });

  return response.text || "I'm sorry, I couldn't generate a suggestion right now. Please try rephrasing your question.";
};

export const getCropRates = async (state: string, crop: string, city: string, language: Language): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are an agricultural market analyst. 
    Find the latest market rates (Mandi prices) for ${crop} in ${city}, ${state}, India.
    Provide a summary of the current prices (min, max, average) and any recent trends in that specific city/region.
    Mention the source or date if available.
    Provide the response in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    
    Format the response clearly. 
    Use a Markdown table for the price summary (Min Price, Max Price, Average Price).
    Use bullet points for trends and other details.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text || "Could not fetch crop rates.";
};

export interface HistoricalRate {
  date: string;
  price: number;
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  date: string;
  source: string;
}

export const getAgroNews = async (language: Language): Promise<NewsItem[]> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const prompt = `
    Find the top 5 latest agricultural news stories in India as of ${new Date().toLocaleDateString()}.
    For each story, provide:
    1. A concise title.
    2. A brief 1-2 sentence summary.
    3. The source name.
    4. The date of the news.
    5. A valid URL to the news article.
    
    Provide the response in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'} for the title and summary.
    Return the data as a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              summary: { type: "STRING" },
              source: { type: "STRING" },
              date: { type: "STRING" },
              url: { type: "STRING" }
            },
            required: ["title", "summary", "source", "date", "url"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (error) {
    console.error("Error fetching agro news:", error);
    return [];
  }
};

export const getHistoricalCropRates = async (state: string, crop: string, city: string): Promise<HistoricalRate[]> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const prompt = `
    Generate realistic historical market price data (Mandi rates) for ${crop} in ${city}, ${state}, India for the last 15 days.
    The data should show a realistic trend (slight fluctuations) for this specific city/region.
    Return the data as a JSON array of objects, each with "date" (YYYY-MM-DD) and "price" (number, in ₹ per quintal).
    Ensure the dates are consecutive leading up to today (${new Date().toISOString().split('T')[0]}).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              date: { type: "STRING" },
              price: { type: "NUMBER" }
            },
            required: ["date", "price"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (error) {
    console.error("Error fetching historical rates:", error);
    return [];
  }
};
