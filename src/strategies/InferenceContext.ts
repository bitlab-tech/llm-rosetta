import { AnthropicStrategy, CustomModelStrategy, GemmaStrategy, InferenceStrategy } from ".";
import { LLM, RequestTranslationParamsInput, ResponseStreamTranslationParamsInput } from "../models";
import { LingshuStrategy } from "./LingshuStrategy";

export class InferenceContext {
  private inferenceStrategy: InferenceStrategy;

  private constructor(model: LLM) {
    switch(model) {
      case LLM.ANTHROPIC: 
        this.inferenceStrategy = new AnthropicStrategy();
        return;
      case LLM.CUSTOM:
        this.inferenceStrategy = new CustomModelStrategy();
        return;
      case LLM.GEMMA:
        this.inferenceStrategy = new GemmaStrategy();
        return;
      case LLM.LINGSHU:
        this.inferenceStrategy = new LingshuStrategy();
        return;
      default:
        throw new Error(`No strategy found for ${model}.`);
    }
  }

  public static create(model: LLM) {
    return new InferenceContext(model);
  }

  public setStrategy(strategy: InferenceStrategy) {
    this.inferenceStrategy = strategy;
    return this;
  }

  public translateFromOpenAI(params: RequestTranslationParamsInput) {
    return this.inferenceStrategy?.translateFromOpenAI(params);
  }

  public translateFromReponseStreamChunk(
    params: ResponseStreamTranslationParamsInput
  ) {
    return this.inferenceStrategy.translateFromResponseStreamChunk(params);
  }
}