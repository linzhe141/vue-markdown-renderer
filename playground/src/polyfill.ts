// @ts-nocheck
import GraphemeSplitter from "grapheme-splitter";

// Polyfill Segmenter
class PolyfillSegmenter {
  constructor(locale = "en", options = { granularity: "grapheme" }) {
    this.locale = locale;
    this.granularity = options.granularity;
    this.splitter = new GraphemeSplitter();
  }

  segment(input) {
    if (this.granularity === "grapheme") {
      const graphemes = this.splitter.splitGraphemes(input);
      return graphemes.map((s, i) => ({
        segment: s,
        index: i,
        isWordLike: true,
      }));
    }

    if (this.granularity === "word") {
      // 简单的空格/标点分词（中文可以按字符切）
      const words = input.split(/(\s+|[,.!?，。！？])/).filter(Boolean);
      let index = 0;
      return words.map((w) => {
        const obj = {
          segment: w,
          index,
          isWordLike: /\w|\p{Script=Han}/u.test(w),
        };
        index += w.length;
        return obj;
      });
    }

    if (this.granularity === "sentence") {
      const sentences = input.split(/([.!?。！？]+)/).filter(Boolean);
      let index = 0;
      return sentences.map((s) => {
        const obj = { segment: s, index, isWordLike: true };
        index += s.length;
        return obj;
      });
    }

    return [{ segment: input, index: 0, isWordLike: true }];
  }

  resolvedOptions() {
    return { locale: this.locale, granularity: this.granularity };
  }
}

// 自动挂载到 Intl 上（保持兼容）
if (typeof Intl.Segmenter === "undefined") {
  Intl.Segmenter = PolyfillSegmenter;
}
