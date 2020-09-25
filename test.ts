import { assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { convertValue, uri } from "./uri.ts";

Deno.test({
  name: "uri",
  fn: () => {
    const API_URL = "https://api.example.com/";
    // UrlSearchParams does not support non-strings
    const id = BigInt("112233445566778899").toString(10);
    const limit = 5..toString(10);
    const offset = 5..toString(10);

    assertEquals(
      uri`${API_URL}/${"path"}`,
      "https://api.example.com/path",
    );

    assertEquals(
      uri`${API_URL}/${"/path"}`,
      "https://api.example.com/path",
    );

    assertEquals(
      uri`${API_URL}/${"/path"}/${1}`,
      "https://api.example.com/path/1",
    );

    assertEquals(
      uri`${API_URL}/${"/path"}/${1}?`,
      "https://api.example.com/path/1",
    );

    assertEquals(
      uri`${API_URL}/${"/path"}/left${1}right`,
      "https://api.example.com/path/left1right",
    );

    assertEquals(
      uri`${API_URL}/${"/path"}/${{ "a b": "b a" }}`,
      "https://api.example.com/path/a+b=b+a",
    );

    assertEquals(
      uri`${API_URL}/${"/path"}/${{ "a%b": "b%a" }}`,
      "https://api.example.com/path/a%25b=b%25a",
    );

    // featured example
    assertEquals(
      uri`${API_URL}/users/${id}/posts/${{ limit: limit, offset: offset }}`,
      "https://api.example.com/users/112233445566778899/posts/limit=5&offset=5",
    );
  },
});

Deno.test({
  name: "convertValue",
  fn: () => {
    assertEquals(
      convertValue("abc"),
      "abc",
    );

    // url encoding
    assertEquals(
      convertValue("abc✨"),
      "abc%E2%9C%A8",
    );

    assertEquals(
      convertValue({ bool: "true", other: "✨" }),
      new URLSearchParams({ bool: "true", other: "✨" }),
    );
  },
});
