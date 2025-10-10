import { OpenAIRequest } from "./OpenAIRequest";

export interface TranslationParamsInput {
  requestBody: OpenAIRequest;
  huggingfaceModelId?: string;
  systemInstruction?: string;
}