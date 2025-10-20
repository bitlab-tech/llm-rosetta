import {
  OpenAIChunk,
  OpenAIRequest,
  RequestToProvider,
  RequestTranslationParamsInput,
  ResponseStreamTranslationParamsInput
} from "../models";

export interface InferenceStrategy {
  translateFromOpenAI(
    params: RequestTranslationParamsInput
  ): Promise<RequestToProvider | OpenAIRequest>;
  translateFromResponse(): any;
  translateFromResponseStreamChunk(
    params: ResponseStreamTranslationParamsInput
  ): Promise<OpenAIChunk>;
}