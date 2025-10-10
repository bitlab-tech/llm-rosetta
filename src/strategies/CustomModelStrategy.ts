import { ConversationRole } from "../models/ConversationRole";
import { OpenAIMessage, OpenAIMessageContent } from "../models/OpenAIMessage";
import { TranslationParamsInput } from "../models/TranslationParamsInput";
import { InferenceStrategy } from "./InferenceStrategy";
import { AutoTokenizer } from '@huggingface/transformers';

export class CustomModelStrategy implements InferenceStrategy {
  async translateFromOpenAI(params: TranslationParamsInput) {
    const { requestBody, huggingfaceModelId, systemInstruction } = params;
    // validate model id
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

    let systemMsg = '';
    if (systemInstruction) systemMsg += systemInstruction + '\n';
    const sysMessage =
      messages.findLast((m: OpenAIMessage) => m.role === ConversationRole.SYSTEM);
    if (sysMessage) {
      sysMessage.content = systemMsg + sysMessage.content;
    }

    const imageMessage =
      messages.findLast((m: OpenAIMessage) =>
        m.content[1] && m.content[1] instanceof Object && m.content[1].image_url);
    
    const imageUrls = imageMessage ?
      [(imageMessage?.content[1] as OpenAIMessageContent).image_url?.url.split(',')[1]] : undefined

    // Apply chat template
    const tokenizer = await AutoTokenizer.from_pretrained(huggingfaceModelId);
    const formatted = tokenizer.apply_chat_template(messages as any, {
      tokenize: false,
      add_generation_prompt: true,
    } as any);
  
    return {
      prompt: formatted,
      max_tokens,
      temperature,
      top_p,
      images: imageUrls
    };
  }
}