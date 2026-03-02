import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getStreakMultiplier,
  calculateAccuracy,
  calculateScore,
} from "./scoring.js";

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

describe("calculateAccuracy", () => {
  it("returns 1 for exact match", () => {
    assert.equal(calculateAccuracy("hello", "hello"), 1);
  });

  it("returns 0 for completely wrong", () => {
    assert.equal(calculateAccuracy("abc", "xyz"), 0);
  });

  it("handles different lengths", () => {
    const acc = calculateAccuracy("ab", "abc");
    assert.equal(acc, 2 / 3);
  });
});

describe("calculateScore", () => {
  it("scores correct words at 100 points each", () => {
    const result = calculateScore("hello world", "hello world", 0, 0);
    assert.equal(result.wordScore, 200);
    assert.equal(result.perfect, true);
  });

  it("adds time bonus for perfect answers", () => {
    const result = calculateScore("hello", "hello", 10, 0);
    assert.equal(result.timeBonus, 20);
    assert.equal(result.total, 120); // 100 + 20
  });

  it("no time bonus for imperfect answers", () => {
    const result = calculateScore("hello", "hellx", 10, 0);
    assert.equal(result.timeBonus, 0);
    assert.equal(result.perfect, false);
  });

  it("applies streak multiplier", () => {
    const result = calculateScore("hello", "hello", 0, 5);
    assert.equal(result.multiplier, 2);
    assert.equal(result.total, 200); // 100 * 2
  });

  it("calculates partial accuracy score", () => {
    // "hell" matches 4 of 5 chars → accuracy 0.8 → wordScore ~80
    const result = calculateScore("hello", "hellx", 0, 0);
    assert.equal(result.accuracy, 0.8);
    assert.equal(result.wordScore, 80);
  });
});
