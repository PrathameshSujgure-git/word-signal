import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  scrambleWord,
  scrambleMessage,
  isAutoSolved,
  getWordDisplay,
} from "./ciphers.js";

describe("scrambleWord", () => {
  it("returns same word for 1-2 char words", () => {
    assert.equal(scrambleWord("a"), "a");
    assert.equal(scrambleWord("is"), "is");
  });

  it("scrambles longer words to different order", () => {
    const word = "fortune";
    const scrambled = scrambleWord(word);
    assert.notEqual(scrambled, word);
    assert.equal(scrambled.length, word.length);
    // same letters
    assert.deepEqual([...scrambled].sort(), [...word].sort());
  });

  it("preserves all original characters", () => {
    const word = "hello";
    const scrambled = scrambleWord(word);
    assert.deepEqual([...scrambled].sort(), [...word].sort());
  });

  it("returns different result than original for 3+ char words", () => {
    // Run multiple times to ensure re-shuffle logic works
    for (let i = 0; i < 10; i++) {
      const scrambled = scrambleWord("test");
      assert.notEqual(scrambled, "test");
    }
  });
});

describe("scrambleMessage", () => {
  it("splits message into word states", () => {
    const result = scrambleMessage("hack the planet");
    assert.equal(result.words.length, 3);
    assert.equal(result.words[0]!.original, "hack");
    assert.equal(result.words[1]!.original, "the");
    assert.equal(result.words[2]!.original, "planet");
  });

  it("auto-solves short words", () => {
    const result = scrambleMessage("i am a hero");
    // "i" and "a" are <=2 chars, should be same as original
    assert.equal(result.words[0]!.scrambled, "i");
    assert.equal(result.words[2]!.scrambled, "a");
  });

  it("scrambles longer words", () => {
    const result = scrambleMessage("fortune");
    assert.notEqual(result.words[0]!.scrambled, "fortune");
  });

  it("preserves original text", () => {
    const msg = "hack the planet";
    const result = scrambleMessage(msg);
    assert.equal(result.original, msg);
  });
});

describe("isAutoSolved", () => {
  it("returns true for short words", () => {
    assert.equal(isAutoSolved("i"), true);
    assert.equal(isAutoSolved("is"), true);
    assert.equal(isAutoSolved(""), true);
  });

  it("returns false for longer words", () => {
    assert.equal(isAutoSolved("the"), false);
    assert.equal(isAutoSolved("hack"), false);
  });
});

describe("getWordDisplay", () => {
  it("shows original for auto-solved words", () => {
    const state = {
      original: "is",
      scrambled: "is",
      revealedPositions: new Set<number>(),
      firstRevealed: false,
    };
    assert.equal(getWordDisplay(state), "is");
  });

  it("shows scrambled by default", () => {
    const state = {
      original: "hack",
      scrambled: "cahk",
      revealedPositions: new Set<number>(),
      firstRevealed: false,
    };
    assert.equal(getWordDisplay(state), "cahk");
  });

  it("reveals positions from unscramble tool", () => {
    const state = {
      original: "hack",
      scrambled: "cahk",
      revealedPositions: new Set([0, 2]),
      firstRevealed: false,
    };
    // pos 0 = 'h' (from original), pos 2 = 'c' (from original)
    assert.equal(getWordDisplay(state), "hack");
  });

  it("reveals first letter when firstRevealed is true", () => {
    const state = {
      original: "hack",
      scrambled: "cahk",
      revealedPositions: new Set<number>(),
      firstRevealed: true,
    };
    const display = getWordDisplay(state);
    assert.equal(display[0], "h"); // first letter from original
  });
});
