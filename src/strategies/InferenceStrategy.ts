import { TranslationParamsInput } from "../models/TranslationParamsInput";

export interface InferenceStrategy {
  translateFromOpenAI(params: TranslationParamsInput): any;
  translateFromBedrock(): any;
  translateFromBedrockStream(): any;
}