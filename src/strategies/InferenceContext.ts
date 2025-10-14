import { LLM } from "../models/LLM";
import { TranslationParamsInput } from "../models/TranslationParamsInput";
import { AnthropicStrategy } from "./AnthropicStrategy";
import { CustomModelStrategy } from "./CustomModelStrategy";
import { GemmaStrategy } from "./GemmaStrategy";
import { InferenceStrategy } from "./InferenceStrategy";

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

  public translateFromOpenAI(params: TranslationParamsInput) {
    return this.inferenceStrategy?.translateFromOpenAI(params);
  }
}