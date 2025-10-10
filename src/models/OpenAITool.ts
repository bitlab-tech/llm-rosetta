class OpenAIToolFunction {
  name?: string;
  arguments?: string;
}

export class OpenAITool {
  id?: string;
  type?: string;
  function?: OpenAIToolFunction;
}