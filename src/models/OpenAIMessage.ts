import { ConversationRole, OpenAITool } from ".";

export interface OpenAIMessage {
  role: ConversationRole;
  content: string | OpenAIMessageContent[];
  tool_use_id?: string;
  tool_call_id?: string;
  tool_calls?: OpenAITool[];
}

export interface OpenAIMessageContent {
  type: string;
  image?: string;
  image_url?: { url: string };
}

export function instanceOfOpenAIMessageContent(
  object: any
): object is OpenAIMessageContent {
  return 'type' in object;
}