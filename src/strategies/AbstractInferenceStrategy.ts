import { InferenceStrategy } from ".";
import { RequestTranslationParamsInput, ResponseStreamTranslationParamsInput } from "../models";
import { OpenAIChunk } from "../models/OpenAIChunk";

export abstract class AbstractInferenceStrategy implements InferenceStrategy {
  abstract translateFromOpenAI(params: RequestTranslationParamsInput): any;

  translateFromResponse(): any {
    throw new Error("Not implemented");
  }

  async translateFromResponseStreamChunk(
    params: ResponseStreamTranslationParamsInput
  ): Promise<OpenAIChunk> {
    // Get params
    const { chunkBytes, model, toolCallIndex } = params;

    // Decode stream chunk bytes
    const decoded = JSON.parse(new TextDecoder().decode(chunkBytes));

    // Convert Claude response to OpenAI format
    const openAiChunk = this.convertChunkToOpenAI(decoded, model, toolCallIndex);
    return openAiChunk;
  }

  convertChunkToOpenAI(
    claudeChunk: any,
    requestModel?: string,
    toolCallIndex?: any,
  ) {
    const { choices, type, delta, content_block, index = 0 } = claudeChunk;
    const openAiChunk = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion.chunk' as const,
      created: Math.floor(Date.now() / 1000),
      model: requestModel || 'custom-model',
      choices: [{ index: 0, delta: {} as any, finish_reason: null as any }],
    };
    const choice = openAiChunk.choices[0];
    const handlers = {
      undefined: () => {
        if (choices[0].stop_reason === 'stop') {
          choice.finish_reason = 'stop';
        } else {
          choice.delta.content = choices[0].text;
        }
      },
      content_block_delta: () => {
        if (delta.type === 'text_delta') {
          choice.delta.content = delta.text;
        } else if (delta.type === 'input_json_delta') {
          const toolIndex = toolCallIndex?.[index] || 0;
          choice.delta.tool_calls = [
            {
              index: toolIndex,
              function: { arguments: delta.partial_json },
            },
          ];
        }
      },
      content_block_start: () => {
        if (content_block?.type === 'tool_use') {
          if (toolCallIndex) {
            toolCallIndex[index] = toolCallIndex.counter || 0;
            toolCallIndex.counter = (toolCallIndex.counter || 0) + 1;
          }
          choice.delta.tool_calls = [
            {
              index: toolCallIndex?.[index] || 0,
              id: content_block.id,
              type: 'function' as const,
              function: { name: content_block.name, arguments: '' },
            },
          ];
        }
      },
      content_block_stop: () => {
        if (toolCallIndex?.[index] !== undefined) {
          choice.delta.tool_calls = [
            {
              index: toolCallIndex[index],
              function: { arguments: '{}' },
            },
          ];
        }
      },
      message_stop: () => {
        choice.finish_reason = 'stop';
      },
    } as const;
    handlers[type as keyof typeof handlers]?.();
    return openAiChunk;
  }
}