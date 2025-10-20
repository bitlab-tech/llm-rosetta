import { AbstractInferenceStrategy } from ".";
import { OpenAIRequest, RequestToProvider, RequestTranslationParamsInput } from "../models";

export class GemmaStrategy extends AbstractInferenceStrategy {
  async translateFromOpenAI(
    params: RequestTranslationParamsInput
  ): Promise<RequestToProvider | OpenAIRequest> {
    const { requestBody } = params;
    return requestBody;
  }
}
