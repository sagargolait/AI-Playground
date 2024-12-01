import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { CoreMessage, streamText } from "ai";
import { toast } from "sonner";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, config = {} } = await req.json();

  // Default configuration values
  const modelConfig = {
    models: config.model ?? "gemini-pro",
    temperature: config.temperature ?? 0.7,
    topP: config.topP ?? 1,
    topK: 1,
    frequencyPenalty: config.frequencyPenalty ?? 0,
    presencePenalty: config.presencePenalty ?? 0,
  };
  try {
    const response = await streamText({
      model: google(modelConfig.models),
      messages: messages as CoreMessage[],
      ...modelConfig,
    });

    return response.toDataStreamResponse();
  } catch (error) {
    toast.error(error as string);
    return new Response("An error occurred during chat processing", {
      status: 500,
    });
  }
}
