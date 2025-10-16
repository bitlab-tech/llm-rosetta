import { OpenAIRequest } from ".";

export interface RequestTranslationParamsInput {
  requestBody: OpenAIRequest;
  huggingfaceModelId?: string;
  systemInstruction?: string;
}