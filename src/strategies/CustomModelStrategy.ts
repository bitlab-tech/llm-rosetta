import { AutoTokenizer } from "@huggingface/transformers";
import { AbstractCustomModelStrategy } from ".";
import {
  RequestTranslationParamsInput,
  OpenAIMessage,
  ConversationRole,
  OpenAIContentType
} from "../models";

export class CustomModelStrategy extends AbstractCustomModelStrategy {
  async translateFromOpenAI(params: RequestTranslationParamsInput) {
    // validate model id
    const { requestBody, huggingfaceModelId, systemInstruction } = params;
    if (!huggingfaceModelId)
      throw new Error("Please provide Huggingface Model ID");

    const {
      messages,
      max_tokens = 4096,
      temperature,
      top_p,
      tools,
      tool_choice,
    } = requestBody;
    
    if (!messages) throw new Error("Request message is empty");

    // Process system messages
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

    // Process request images
    const images = this.processImages(messages);

    // Apply chat template
    const formatted = await this.applyChatTemplate(huggingfaceModelId, messages);
  
    // Return result
    return {
      prompt: formatted,
      max_tokens,
      temperature,
      top_p,
      images
    };
  }

  extractSystemMessage(
    defaultSystemInstruction: string | undefined,
    requestSystemMessage: OpenAIMessage | undefined
  ) {
    let combinedSystemMessage = '';
    if (defaultSystemInstruction) combinedSystemMessage += defaultSystemInstruction + '\n';
    if (requestSystemMessage) {
      combinedSystemMessage += requestSystemMessage.content;
    }
    return combinedSystemMessage;
  }

  processImages(messages: OpenAIMessage[]) {
    const result: string[] = [];
    for (const message of messages) {
      for (const content of message.content) {
        if (content instanceof Object && content.image_url) {
          if (content.type === OpenAIContentType.IMAGE_URL) {
            result.push(content.image_url?.url.split(',')[1]);
          } else if (content.type === OpenAIContentType.IMAGE && content.image) {
            result.push(content.image);
          }
        }
      }
    }
    return result;
  }

  async applyChatTemplate(huggingfaceModelId: string, messages: OpenAIMessage[]) {
    const tokenizer = await AutoTokenizer.from_pretrained(huggingfaceModelId);
    const formatted = tokenizer.apply_chat_template(messages as any, {
      tokenize: false,
      add_generation_prompt: true,
    } as any);
    return formatted;
  }
}