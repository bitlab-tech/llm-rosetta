import { OpenAIMessage } from "./OpenAIMessage";
import { OpenAITool } from "./OpenAITool";
import { OpenAIToolChoice } from "./OpenAIToolChoice";

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  tools?: object[];
  tool_choice?: OpenAIToolChoice | OpenAITool;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: any;
  n?: number;
  logit_bias?: any;
  user?: string;
}