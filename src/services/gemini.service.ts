
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenAI;
  
  constructor() {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeReviews(reviews: string): Promise<AnalysisReport> {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      Analyze the following customer reviews. The reviews are separated by newlines.
      Your task is to perform three actions and return the result as a single, valid JSON object that strictly adheres to the provided schema.

      1.  **Sentiment Trend Analysis:**
          - For each review, determine its sentiment on a scale of -1.0 (very negative) to 1.0 (very positive).
          - If a date or relative time (e.g., "2 weeks ago") is mentioned in a review, extract it.
          - If no date is found, assume the reviews are in chronological order and label them sequentially as "Review 1", "Review 2", etc.
          - Aggregate these findings into a sentiment trend array.

      2.  **Keyword Extraction for Word Clouds:**
          - Identify the 15 most frequent and impactful keywords or short phrases associated with positive sentiment.
          - Identify the 15 most frequent and impactful keywords or short phrases associated with negative sentiment.
          - Assign a numerical value (e.g., frequency or importance score) to each keyword.

      3.  **Executive Summary Generation:**
          - Based on the entire set of reviews, write a concise, professional executive summary.
          - This summary must identify the top 3 actionable areas for improvement, derived primarily from the negative feedback.
          - Format the summary with clear headings or bullet points for each actionable item.

      Here are the reviews:
      ---
      ${reviews}
      ---
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            sentimentTrend: {
                type: Type.ARRAY,
                description: "An array of sentiment data points over time.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        time: { type: Type.STRING, description: "The date or time period for the data point (e.g., '2023-10-26' or 'Review 1')." },
                        sentiment: { type: Type.NUMBER, description: "Sentiment score for this time period, from -1.0 to 1.0." }
                    },
                    required: ["time", "sentiment"]
                }
            },
            wordClouds: {
                type: Type.OBJECT,
                description: "Keywords for positive and negative word clouds.",
                properties: {
                    positive: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                value: { type: Type.NUMBER, description: "Frequency or importance score." }
                            },
                            required: ["text", "value"]
                        }
                    },
                    negative: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                value: { type: Type.NUMBER, description: "Frequency or importance score." }
                            },
                             required: ["text", "value"]
                        }
                    }
                },
                required: ["positive", "negative"]
            },
            executiveSummary: {
                type: Type.STRING,
                description: "A professional summary identifying the top 3 actionable areas for improvement."
            }
        },
        required: ["sentimentTrend", "wordClouds", "executiveSummary"]
    };

    try {
        const result = await this.genAI.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString) as AnalysisReport;
    } catch (error) {
        console.error("Error analyzing reviews:", error);
        throw new Error("Failed to analyze reviews. Please check the console for more details.");
    }
  }
}
