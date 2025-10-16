import { CustomModelStrategy } from ".";
import {
  ConversationRole,
  OpenAIMessage,
  RequestToProvider,
  RequestTranslationParamsInput
} from "../models";

export class LingshuStrategy extends CustomModelStrategy {
  // Overrides
  async translateFromOpenAI(params: RequestTranslationParamsInput): Promise<RequestToProvider> {
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
    const processedMessages = messages.map((m: OpenAIMessage, index: number) => {
      const contents = m.content;
      if (
        m.content instanceof String ||
        index === messages.length - 1
      ) return m;

      let i = 0;
      while (i < contents.length) {
        if (
          contents instanceof Object &&
          contents[i].type === 'image_url'
        ) {
          contents.splice(i, 1);
        } else {
            i++;
        }
      }
      return m;
    });
    const images = this.processImages(processedMessages);

    // Apply chat template
    const formatted = await this.applyChatTemplate(huggingfaceModelId, messages);
  
    // Return result
    return {
      prompt: formatted,
      max_tokens,
      temperature,
      top_p,
      images: images.length > 0 ? [images[images.length - 1]] : undefined
    };
  }
}