import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getStreakMultiplier, calculateScore } from "./scoring.js";

describe("getStreakMultiplier", () => {
  it("returns 1 for streak < 3", () => {
    assert.equal(getStreakMultiplier(0), 1);
    assert.equal(getStreakMultiplier(2), 1);
  });

  it("returns 1.5 at streak 3", () => {
    assert.equal(getStreakMultiplier(3), 1.5);
    assert.equal(getStreakMultiplier(4), 1.5);
  });

  it("returns 2 at streak 5", () => {
    assert.equal(getStreakMultiplier(5), 2);
    assert.equal(getStreakMultiplier(9), 2);
  });

  it("returns 3 at streak 10+", () => {
    assert.equal(getStreakMultiplier(10), 3);
    assert.equal(getStreakMultiplier(50), 3);
  });
});

describe("calculateScore", () => {
  it("scores solved words at wordLength * 20", () => {
    const words = [
      { original: "hello", solved: true, skipped: false, hinted: false }, // 5*20 = 100
      { original: "world", solved: true, skipped: false, hinted: false }, // 5*20 = 100
    ];
    const result = calculateScore(words, 0, 0, 0);
    assert.equal(result.wordScore, 200);
    assert.equal(result.total, 200);
    assert.equal(result.won, true);
  });

  it("gives 0 points for hinted words", () => {
    const words = [
      { original: "hello", solved: true, skipped: false, hinted: true },
    ];
    const result = calculateScore(words, 0, 0, 0);
    assert.equal(result.wordScore, 0);
  });

  it("gives 0 points for skipped words", () => {
    const words = [
      { original: "hello", solved: false, skipped: true, hinted: false },
    ];
    const result = calculateScore(words, 0, 0, 0);
    assert.equal(result.wordScore, 0);
    assert.equal(result.won, false);
  });

  it("adds time bonus when all solved", () => {
    const words = [
      { original: "hack", solved: true, skipped: false, hinted: false },
    ];
    const result = calculateScore(words, 10, 0, 0);
    assert.equal(result.timeBonus, 30); // 10 * 3
    assert.equal(result.allSolved, true);
  });

  it("no time bonus when not all solved", () => {
    const words = [
      { original: "hack", solved: true, skipped: false, hinted: false },
      { original: "planet", solved: false, skipped: true, hinted: false },
    ];
    const result = calculateScore(words, 10, 0, 0);
    assert.equal(result.timeBonus, 0);
  });

  it("applies tool penalty", () => {
    const words = [
      { original: "hack", solved: true, skipped: false, hinted: false }, // 80
    ];
    const result = calculateScore(words, 0, 0, 3); // 3 tool uses = -30
    assert.equal(result.toolPenalty, 30);
    assert.equal(result.total, 50); // 80 - 30
  });

  it("applies streak multiplier", () => {
    const words = [
      { original: "hello", solved: true, skipped: false, hinted: false }, // 100
    ];
    const result = calculateScore(words, 0, 5, 0); // streak 5 = x2
    assert.equal(result.multiplier, 2);
    assert.equal(result.total, 200);
  });

  it("win requires >= 60% solved", () => {
    const words = [
      { original: "a", solved: true, skipped: false, hinted: false },
      { original: "b", solved: true, skipped: false, hinted: false },
      { original: "c", solved: true, skipped: false, hinted: false },
      { original: "d", solved: false, skipped: true, hinted: false },
      { original: "e", solved: false, skipped: true, hinted: false },
    ];
    const result = calculateScore(words, 0, 0, 0);
    assert.equal(result.won, true); // 3/5 = 60%
  });

  it("loss when < 60% solved", () => {
    const words = [
      { original: "a", solved: true, skipped: false, hinted: false },
      { original: "b", solved: false, skipped: true, hinted: false },
      { original: "c", solved: false, skipped: true, hinted: false },
      { original: "d", solved: false, skipped: true, hinted: false },
      { original: "e", solved: false, skipped: true, hinted: false },
    ];
    const result = calculateScore(words, 0, 0, 0);
    assert.equal(result.won, false); // 1/5 = 20%
  });

  it("total never goes negative", () => {
    const words = [
      { original: "hi", solved: true, skipped: false, hinted: false }, // 40
    ];
    const result = calculateScore(words, 0, 0, 10); // penalty = 100
    assert.ok(result.total >= 0);
  });
});
