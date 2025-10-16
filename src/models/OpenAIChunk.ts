export interface OpenAIChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: OpenAIChunkChoice[];
}

export interface OpenAIChunkChoice {
  index: number;
  delta: any;
  finish_reason: any;
}