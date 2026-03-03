import OpenAI from "openai";

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});