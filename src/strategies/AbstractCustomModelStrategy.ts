import { Tensor } from "@huggingface/transformers";
import { TranslationParamsInput } from "../models/TranslationParamsInput";
import { InferenceStrategy } from "./InferenceStrategy";
import { OpenAIMessage } from "../models/OpenAIMessage";

export abstract class AbstractCustomModelStrategy implements InferenceStrategy {
  // Strategy methods
  abstract translateFromOpenAI(params: TranslationParamsInput): any;
  abstract translateFromBedrock(): any;
  abstract translateFromBedrockStream(): any;

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