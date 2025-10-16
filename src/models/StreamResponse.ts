export interface StreamResponse {
  body: AsyncIterable<StreamChunk> | undefined;
  contentType: string | undefined;
}

export interface StreamChunk {
  chunk?: PayloadPart;
  error?: {
    type: 'timeout' | 'throttling' | 'validation' | 'server_error' | 'unavailable';
    message: string;
  };
}

export interface PayloadPart {
  bytes?: Uint8Array | undefined;
}

export interface ToolCallCounter {
  counter: number;
}