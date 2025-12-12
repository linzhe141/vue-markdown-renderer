const startTag = "<think>";
const endTag = "</think>";
type ThinkState = "idle" | "thinking" | "finished";

export function transformThink() {
  let buffer = "";
  let state: ThinkState = "idle";

  return function processThink(chunk: string) {
    buffer += chunk;
    if (when(state, "idle")) {
      const startIdx = buffer.indexOf(startTag);
      const result = {
        state,
        buffer,
      };
      if (startIdx !== -1) {
        buffer = buffer.slice(startIdx + startTag.length);
        state = "thinking";
      }
      return result;
    } else if (when(state, "thinking")) {
      const endIdx = buffer.indexOf(endTag);
      const result = { state, buffer };
      if (endIdx !== -1) {
        state = "finished";
      }
      return result;
    } else {
      const endIdx = buffer.indexOf(endTag);
      const content = buffer.slice(0, endIdx);
      const rest = buffer.slice(endIdx + endTag.length);
      return { state, buffer: content, rest };
    }
  };
}

function when(currentState: ThinkState, state: ThinkState) {
  return currentState === state;
}
