import { AutoTokenizer, Message } from "@huggingface/transformers";
import { CustomModelStrategy } from ".";
import { OpenAIMessage, OpenAIContentType } from "../models";

export class GemmaStrategy extends CustomModelStrategy {
  // overrides
  async applyChatTemplate(huggingfaceModelId: string, messages: OpenAIMessage[]) {
    const updatedMessages = messages.map((m: OpenAIMessage) => {
      for (const content of m.content) {
        if (content instanceof Object && content.image_url) {
          if (content.type === OpenAIContentType.IMAGE_URL) {
            content.type = OpenAIContentType.IMAGE;
          }
        }
      }
      return m;
    });

    const tokenizer = await AutoTokenizer.from_pretrained(huggingfaceModelId);
    const formatted = tokenizer.apply_chat_template((updatedMessages as Message[]), {
      tokenize: false,
      add_generation_prompt: true,
    } as any);
    return formatted;
  }
}
