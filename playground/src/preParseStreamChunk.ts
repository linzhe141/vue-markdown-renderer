type State =
  | "text"
  | "symbolMatchingStart"
  | "symbolContent"
  | "symbolMatchingEnd";

type TextBlock = {
  type: "text";
  content: string;
};
type SymbolBlock = {
  type: "symbol";
  symbol: string;
  content: string;
  finished: boolean;
};
type Block = TextBlock | SymbolBlock;

export type ParseNode = Block;

type SplitRule = {
  start: string;
  end: string;
};

export class PreParse {
  private buffer = "";
  private index = 0;
  private state: State = "text";
  private chunkBlocks: Block[] = [];
  private currentBlock: Block | null = null;
  private splitRules: SplitRule[] = [];
  private matchers: { start: Matcher; end: Matcher }[] = [];
  private activeMatcher: { start: Matcher; end: Matcher } | null = null;
  private textStateTryMatchers = new Set<{ start: Matcher; end: Matcher }>();

  constructor() {
    this.splitRules = [
      { start: "<think>", end: "</think>" },
      { start: "<ToolCall>", end: "</ToolCall>" },
      { start: "<th>", end: "</th>" },
      { start: "::ToolCall::", end: "::ToolCall::" },
    ];
    this.matchers = this.splitRules.map((i) => ({
      start: new Matcher(i.start),
      end: new Matcher(i.end),
    }));
  }

  appendChunk(chunk: string) {
    this.buffer += chunk;
    return this.processChunk();
  }

  processChunk() {
    while (this.index < this.buffer.length) {
      const currentChar = this.buffer[this.index];
      switch (this.state) {
        case "text": {
          this.stateText(currentChar);
          break;
        }
        case "symbolMatchingStart": {
          this.stateSymbolMatchingStart(currentChar);
          break;
        }
        case "symbolContent": {
          this.stateSymbolContent(currentChar);
          break;
        }
        case "symbolMatchingEnd": {
          this.stateSymbolMatchingEnd(currentChar);
          break;
        }
      }
      this.index++;
    }
    return this.chunkBlocks;
  }

  getPendingMatchers() {
    return this.matchers.filter((i) => !this.textStateTryMatchers.has(i));
  }

  stateText(char: string) {
    let matched = false;
    for (const matcher of this.getPendingMatchers()) {
      const { start: startMatcher } = matcher;
      const { state } = startMatcher.match(char);
      if (state === "matching") {
        this.activeMatcher = matcher;
        this.textStateTryMatchers.add(matcher);
        this.state = "symbolMatchingStart";
        matched = true;
        return;
      } else if (state === false) {
        // 这个 matcher 匹配失败，重置它的状态
        // 继续尝试下一个 matcher
        continue;
      }
    }
    // 如果没有任何 matcher 匹配成功，将字符作为文本内容
    if (!matched) {
      if (this.currentBlock === null) {
        this.currentBlock = {
          type: "text",
          content: char,
        };
        this.chunkBlocks.push(this.currentBlock);
      } else {
        this.currentBlock.content += char;
      }
    }
  }

  stateSymbolMatchingStart(char: string) {
    if (!this.activeMatcher) {
      console.error("internal bug");
      return;
    }
    const { state, matchedCount } = this.activeMatcher.start.match(char);
    if (state === false) {
      this.state = "text";
      // rollback
      this.index = this.index - matchedCount - 1;
    } else if (state === "matching") {
      //
    } else if (state === true) {
      this.state = "symbolContent";
      this.textStateTryMatchers.clear();
      this.currentBlock = {
        type: "symbol",
        symbol: this.activeMatcher.start.matchstring,
        content: "",
        finished: false,
      };

      this.chunkBlocks.push(this.currentBlock);
    }
  }

  stateSymbolContent(char: string) {
    if (!this.activeMatcher) {
      console.error("internal bug");
      return;
    }
    const { state } = this.activeMatcher.end.match(char);
    if (state === false) {
      this.currentBlock!.content += char;
    } else if (state === "matching") {
      this.state = "symbolMatchingEnd";
    }
  }

  stateSymbolMatchingEnd(char: string) {
    if (!this.activeMatcher) {
      console.error("internal bug");
      return;
    }
    const { state, matchedCount } = this.activeMatcher.end.match(char);
    if (state === false) {
      this.state = "symbolContent";
      const matchedString = this.buffer.slice(
        this.index - matchedCount,
        this.index
      );
      this.currentBlock!.content += matchedString + char;
    } else if (state === "matching") {
      //
    } else if (state === true) {
      this.state = "text";
      const currentBlock = this.currentBlock as SymbolBlock;
      currentBlock.finished = true;
      this.currentBlock = null;
    }
  }
}

type MatchResult =
  | { state: true; matchedCount: number }
  | { state: "matching"; matchedCount: number }
  | { state: false; matchedCount: number };
class Matcher {
  private index = 0;
  constructor(public matchstring: string) {}

  match(char: string): MatchResult {
    if (char === this.matchstring[this.index]) {
      this.index++;
      const matchedCount = this.index;
      if (this.index === this.matchstring.length) {
        this.index = 0;
        return { state: true, matchedCount };
      }
      return {
        state: "matching",
        matchedCount,
      };
    } else {
      const matchedCount = this.index;
      this.index = 0;
      return {
        state: false,
        matchedCount,
      };
    }
  }
}
