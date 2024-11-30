import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { CoreMessage, streamText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export const runtime = "edge";

export async function POST(req: Request, res: Response) {
  const { messages, config = {} } = await req.json();

  // Default configuration values
  const modelConfig = {
    temperature: config.temperature ?? 0.7,
    topP: config.topP ?? 1,
    topK: 1,
    frequencyPenalty: config.frequencyPenalty ?? 0,
    presencePenalty: config.presencePenalty ?? 0,
  };

  const response = await streamText({
    model: google("gemini-pro"),
    messages: messages as CoreMessage[],
    ...modelConfig,
  });

  return response.toDataStreamResponse();
}
