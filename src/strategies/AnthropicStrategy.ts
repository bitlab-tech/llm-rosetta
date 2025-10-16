import {
  RequestTranslationParamsInput,
  OpenAIMessage,
  ConversationRole,
  RequestToProvider
} from "../models";
import { AbstractInferenceStrategy } from "./AbstractInferenceStrategy";

export class AnthropicStrategy extends AbstractInferenceStrategy {
  translateFromOpenAI(params: RequestTranslationParamsInput): Promise<RequestToProvider> {
    // Get params
    const { requestBody, systemInstruction } = params;

    // request params
    const {
      messages,
      max_tokens = 4096,
      temperature,
      top_p,
      tools,
      tool_choice,
    } = requestBody;

    if (!messages) throw new Error("Request message is empty");

    // system msg
    const requestSystemMessage =
      messages.findLast((m: OpenAIMessage) => m.role === ConversationRole.SYSTEM);

    const combinedSystemMessage =
      this.extractSystemMessage(systemInstruction, requestSystemMessage);

    if (combinedSystemMessage) {
      if (requestSystemMessage) {
        requestSystemMessage.content = combinedSystemMessage;
      } else {
        messages.push({
          role: ConversationRole.SYSTEM,
          content: combinedSystemMessage
        });
      }
    }

    // user msg
    const bedrockMessages = messages
      ?.filter((m) => m.role !== ConversationRole.SYSTEM)
      .map((m) => this.parseOpenAIMessageToNativeMessage(m));

    // result body
    const body = {
      anthropic_version: 'bedrock-2023-05-31',
      messages: bedrockMessages,
      max_tokens,
      temperature: temperature
        ? temperature > 0
          ? temperature
          : undefined
        : undefined,
      top_p: top_p ? (top_p < 1 ? top_p : undefined) : undefined,
      ...(combinedSystemMessage && { system: combinedSystemMessage }),
      ...this.buildToolsConfig(tools, tool_choice),
    };

    return body;
  }

  extractSystemMessage(defaultSystemInstruction: string | undefined, requestSystemMessage: OpenAIMessage | undefined): string {
    let combinedSystemMessage = '';
    if (defaultSystemInstruction) combinedSystemMessage += defaultSystemInstruction + '\n';
    if (requestSystemMessage) {
      combinedSystemMessage += requestSystemMessage.content;
    }
    return combinedSystemMessage;
  }

  private parseOpenAIMessageToNativeMessage(message: OpenAIMessage) {
    const messageHandlers = {
      tool: () => ({
        role: ConversationRole.USER,
        content: [
          {
            type: 'tool_result',
            tool_use_id: message.tool_call_id,
            content: this.parseToolContent(message),
          },
        ],
      }),
      assistant: () =>
        message.tool_calls
          ? {
              role: ConversationRole.ASSISTANT,
              content: [
                ...(message.content
                  ? [{ type: 'text', text: message.content }]
                  : []),
                ...message.tool_calls
                  .filter((call) => call.type === 'function')
                  .map((call) => {
                    const args = call.function?.arguments;
                    if (!args) throw new Error();
                    try {
                      return {
                        type: 'tool_use',
                        id: call.id,
                        name: call.function?.name,
                        input: JSON.parse(args),
                      };
                    } catch {
                      return {
                        type: 'tool_use',
                        id: call.id,
                        name: call.function?.name,
                        input: {},
                      };
                    }
                  }),
              ],
            }
          : {
              role: message.role,
              content: this.convertMessageContent(message.content),
            },
    } as const;
    return (
      messageHandlers[message.role as keyof typeof messageHandlers]?.() || {
        role: message.role,
        content: this.convertMessageContent(message.content),
      }
    );
  }

  private convertMessageContent(content: string | any[] | any) {
    if (typeof content === 'string') {
      return [{ type: 'text', text: content }];
    }
    if (!Array.isArray(content)) return content;
    return content.map((item) => {
      switch (item.type) {
        case 'text':
          return { type: 'text', text: item.text };
        case 'image_url': {
          const { url } = item.image_url;
          if (!url?.startsWith('data:')) {
            throw new Error('Only base64 encoded images are supported');
          }
          const [header, data] = url.split(',');
          const mediaMatch = header.match(/data:([^;]+)/);
          if (!mediaMatch) {
            throw new Error('Invalid data URL format');
          }
          return {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaMatch[1],
              data,
            },
          };
        }
        default:
          return item;
      }
    });
  }

  private buildToolsConfig(tools?: any[], tool_choice?: any) {
    const convertedTools = tools?.filter(Boolean).map((tool) =>
      tool.type === 'function'
        ? {
            name: tool.function.name,
            description: tool.function.description,
            input_schema: tool.function.parameters,
          }
        : tool,
    );
    if (!convertedTools?.length) return {};
    const config: any = { tools: convertedTools };
    if (tool_choice) {
      const choiceMap = {
        auto: { type: 'auto' },
        none: { type: 'none' },
      } as const;
      config.tool_choice =
        choiceMap[tool_choice as keyof typeof choiceMap] ||
        (tool_choice?.type === 'function'
          ? {
              type: 'tool',
              name: tool_choice.function.name,
            }
          : undefined);
    }
    return config;
  }

  private parseToolContent(message: OpenAIMessage) {
    try {
      const content = message.content;
      if (!content || content instanceof Array) throw new Error();
      const parsed = JSON.parse(content);
      // Check if it has a nested content array (for multimodal responses)
      if (parsed.content && Array.isArray(parsed.content)) {
        return parsed.content.map((item: any) =>
          item.type === 'image'
            ? {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: item.mimeType,
                  data: item.data,
                },
              }
            : item,
        );
      }
      // Otherwise, return the content as plain text
      return message.content;
    } catch {
      // If parsing fails, return content as-is (plain text/string)
      return message.content;
    }
  };
}