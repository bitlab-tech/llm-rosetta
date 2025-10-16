import {
  OpenAIChunk,
  RequestToProvider,
  RequestTranslationParamsInput,
  ResponseStreamTranslationParamsInput
} from "../models";

export interface InferenceStrategy {
  translateFromOpenAI(params: RequestTranslationParamsInput): Promise<RequestToProvider>;
  translateFromResponse(): any;
  translateFromResponseStreamChunk(
    params: ResponseStreamTranslationParamsInput
  ): Promise<OpenAIChunk>;
}