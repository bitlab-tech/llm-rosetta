import {
  OpenAIChunk,
  RequestTranslationParamsInput,
  ResponseStreamTranslationParamsInput
} from "../models";

export interface InferenceStrategy {
  translateFromOpenAI(params: RequestTranslationParamsInput): any;
  translateFromResponse(): any;
  translateFromResponseStreamChunk(
    params: ResponseStreamTranslationParamsInput
  ): Promise<OpenAIChunk>;
}