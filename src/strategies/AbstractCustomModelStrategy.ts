import { Tensor } from "@huggingface/transformers";
import { OpenAIMessage, RequestTranslationParamsInput } from "../models";
import { AbstractInferenceStrategy } from "./AbstractInferenceStrategy";

export abstract class AbstractCustomModelStrategy extends AbstractInferenceStrategy {
  // Strategy method
  abstract translateFromOpenAI(params: RequestTranslationParamsInput): any;

  // Internal methods
  abstract extractSystemMessage(
    defaultSystemInstruction: string | undefined,
    requestSystemMessage: OpenAIMessage | undefined
  ): string;
  abstract processImages(messages: OpenAIMessage[]): string[];
  abstract applyChatTemplate(
    huggingfaceModelId: string,
    messages: OpenAIMessage[]
  ): Promise<string | Tensor | number[] | number[][] | {
    input_ids: number[] | number[][] | Tensor;
    attention_mask: number[] | number[][] | Tensor;
    token_type_ids?: number[] | number[][] | Tensor;
  }>
}