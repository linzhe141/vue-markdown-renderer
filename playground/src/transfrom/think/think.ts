const startTag = "<think>";
const endTag = "</think>";
type ThinkState = "idle" | "thinking" | "finished";
export function transformThink() {
  let buffer = "";
  let state: ThinkState = "idle";

  return function processThink(chunk: string) {
    if (state === "finished") return;
    buffer += chunk;
    if (isState(state, "idle")) {
      const startIdx = buffer.indexOf(startTag);
      if (startIdx !== -1) {
        buffer = buffer.slice(startIdx + startTag.length);
        state = "thinking";
      }
    }
    if (isState(state, "thinking")) {
      const endIdx = buffer.indexOf(endTag);
      if (endIdx !== -1) {
        const content = buffer.slice(0, endIdx);
        const rest = buffer.slice(endIdx + endTag.length);
        state = "finished";
        return { buffer: content, rest, done: true };
      } else {
        if (buffer) {
          return { buffer, done: false };
        }
      }
    }
  };
}

function isState(currentState: ThinkState, state: ThinkState) {
  return currentState === state;
}
