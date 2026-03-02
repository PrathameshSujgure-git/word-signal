import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  caesarEncrypt,
  caesarDecrypt,
  substitutionEncrypt,
  substitutionDecrypt,
  vigenereEncrypt,
  vigenereDecrypt,
  generateSubstitutionKey,
  encryptMessage,
} from "./ciphers.js";

describe("Caesar cipher", () => {
  it("encrypts lowercase text", () => {
    assert.equal(caesarEncrypt("abc", 3), "def");
  });

  it("decrypts lowercase text", () => {
    assert.equal(caesarDecrypt("def", 3), "abc");
  });

  it("wraps z correctly", () => {
    assert.equal(caesarEncrypt("xyz", 3), "abc");
  });

  it("preserves spaces and punctuation", () => {
    assert.equal(caesarEncrypt("hello, world!", 1), "ifmmp, xpsme!");
  });

  it("handles uppercase letters", () => {
    assert.equal(caesarEncrypt("ABC", 1), "BCD");
    assert.equal(caesarDecrypt("BCD", 1), "ABC");
  });

  it("roundtrips correctly", () => {
    const text = "Hello World 123!";
    assert.equal(caesarDecrypt(caesarEncrypt(text, 13), 13), text);
  });
});

describe("Substitution cipher", () => {
  it("encrypts and decrypts roundtrip", () => {
    const key = "qwertyuiopasdfghjklzxcvbnm";
    const text = "hello world";
    const encrypted = substitutionEncrypt(text, key);
    assert.equal(substitutionDecrypt(encrypted, key), text);
  });

  it("preserves spaces and punctuation", () => {
    const key = "qwertyuiopasdfghjklzxcvbnm";
    const encrypted = substitutionEncrypt("a b! c", key);
    assert.ok(encrypted.includes(" "));
    assert.ok(encrypted.includes("!"));
  });

  it("handles uppercase", () => {
    const key = "qwertyuiopasdfghjklzxcvbnm";
    const encrypted = substitutionEncrypt("Hello", key);
    assert.equal(encrypted[0], encrypted[0].toUpperCase());
    assert.equal(substitutionDecrypt(encrypted, key), "Hello");
  });

  it("generateSubstitutionKey returns valid 26-char permutation", () => {
    const key = generateSubstitutionKey();
    assert.equal(key.length, 26);
    assert.equal(new Set(key).size, 26);
  });
});

describe("Vigenere cipher", () => {
  it("encrypts correctly", () => {
    // key "ab": a(shift 0)->a, b(shift 1)->c, a(shift 0)->c
    assert.equal(vigenereEncrypt("abc", "ab"), "acc");
  });

  it("decrypts correctly", () => {
    assert.equal(vigenereDecrypt("acc", "ab"), "abc");
  });

  it("preserves spaces", () => {
    const text = "hello world";
    const key = "abc";
    const encrypted = vigenereEncrypt(text, key);
    const decrypted = vigenereDecrypt(encrypted, key);
    assert.equal(decrypted, text);
    // spaces should remain
    assert.equal(encrypted.indexOf(" "), text.indexOf(" "));
  });

  it("roundtrips with random key via encryptMessage", () => {
    const result = encryptMessage("test message", "vigenere");
    assert.equal(result.cipherType, "vigenere");
    assert.equal(
      vigenereDecrypt(result.encrypted, result.key as string),
      "test message"
    );
  });
});
