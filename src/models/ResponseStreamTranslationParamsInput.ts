import { ToolCallCounter } from ".";

export interface ResponseStreamTranslationParamsInput {
  chunkBytes: Uint8Array,
  model: string,
  toolCallIndex: ToolCallCounter,
}