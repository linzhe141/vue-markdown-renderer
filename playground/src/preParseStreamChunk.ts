export type ParseNode =
  | string
  | { type: string; content: string; finished: boolean };
export function preParseStreamChunk() {
  let buffer = "";

  const parseNodes: ParseNode[] = [];
  const transforms = [transformThink()];

  function push(node: ParseNode) {
    parseNodes.push(node);
  }
  function updateLast(node: ParseNode) {
    parseNodes.splice(parseNodes.length - 1, 1, node);
  }

  function updateTransformResult(
    type: string,
    content: string,
    finished: boolean
  ) {
    const last = parseNodes[parseNodes.length - 1];
    if (last) {
      if (typeof last !== "string" && last?.type === type) {
        last.content = content;
        last.finished = finished;
      } else {
        push({ type, content, finished });
      }
    } else {
      push({ type, content, finished });
    }
  }
  return function processer(chunk: string) {
    buffer += chunk;
    for (const transform of transforms) {
      const { transformResult } = transform(chunk);
      if (transformResult === null) {
        updateLast(buffer);
      } else {
        const { leading, type, content, tail, finished } = transformResult;
        if (leading) {
          updateLast(leading);
        }
        updateTransformResult(type, content, finished);
        if (tail) {
          push(tail);
          buffer = tail;
        }
      }
    }
    return parseNodes;
  };
}

function transformThink() {
  const startTag = "<think>";
  const endTag = "</think>";
  type State = "before_think_tag" | "in_think_tag" | "after_think_tag";
  let state: State = "before_think_tag";
  let interBuffer = "";
  let content = "";
  let startIdx = -1;
  let endIdx = -1;

  type Result = {
    state: State;
    transformResult: {
      type: "think";
      leading?: string;
      content: string;
      tail?: string;
      finished: boolean;
    } | null;
  };
  function stateBeforeThinkTag(): Result {
    startIdx = interBuffer.indexOf(startTag);

    if (startIdx !== -1) {
      state = "in_think_tag";
      const leading = interBuffer.slice(0, startIdx);
      interBuffer = interBuffer.slice(startIdx + startTag.length);
      return stateInThinkTag(leading);
    }

    return {
      state: "before_think_tag",
      transformResult: null,
    };
  }
  function stateInThinkTag(leading?: string): Result {
    content = interBuffer;
    endIdx = interBuffer.indexOf(endTag);
    if (endIdx !== -1) {
      state = "after_think_tag";
      return stateAfterThinkTag(leading);
    } else {
      return {
        state: "in_think_tag",
        transformResult: {
          type: "think",
          leading,
          content,
          finished: false,
        },
      };
    }
  }
  function stateAfterThinkTag(leading?: string): Result {
    const tail = interBuffer.slice(endIdx + endTag.length);
    const result: Result = {
      state: "after_think_tag",
      transformResult: {
        type: "think",
        leading,
        content: content.slice(0, endIdx),
        tail,
        finished: true,
      },
    };

    // reset
    state = "before_think_tag";
    interBuffer = tail;
    content = "";
    startIdx = -1;
    endIdx = -1;
    return result;
  }
  return function processer(chunk: string): Result {
    interBuffer += chunk;
    if (state === "before_think_tag") {
      return stateBeforeThinkTag();
    } else if (state === "in_think_tag") {
      return stateInThinkTag();
    } else {
      return stateAfterThinkTag();
    }
  };
}
