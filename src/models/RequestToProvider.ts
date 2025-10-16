import { Tensor } from "@huggingface/transformers";

export interface RequestToProvider {
  prompt: string | Tensor | number[] | number[][] | {
    input_ids: number[] | number[][] | Tensor;
    attention_mask: number[] | number[][] | Tensor;
    token_type_ids?: number[] | number[][] | Tensor;
  };
  max_tokens: number | undefined;
  temperature: number | undefined;
  top_p: number | undefined;
  images: string[] | undefined;
}