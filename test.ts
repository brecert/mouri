import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts";
import { convertValue, trimSlashes, uri } from "./uri.ts";

// import example for typechecking
import "./examples/example.ts";

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
      "https://api.example.com/%2Fpath",
    );

    assertEquals(
      uri`${API_URL}/${trimSlashes("/path")}`,
      "https://api.example.com/path",
    );

    assertEquals(
      uri`${API_URL}/${["/path/"]}${["/test/"]}`,
      "https://api.example.com//path//test/",
    );

    assertEquals(
      uri`${API_URL}/${trimSlashes("/path")}/${1}`,
      "https://api.example.com/path/1",
    );

    assertEquals(
      uri`${API_URL}/${trimSlashes("/path")}/${1}?`,
      "https://api.example.com/path/1",
    );

    assertEquals(
      uri`${API_URL}/${trimSlashes("/path")}/left${1}right`,
      "https://api.example.com/path/left1right",
    );

    assertEquals(
      uri`${API_URL}/${trimSlashes("/path")}/${{ "a b": "b a" }}`,
      "https://api.example.com/path/a%20b=b%20a",
    );

    assertEquals(
      uri`${API_URL}/${"path"}/${{ "a%b": "b%a" }}`,
      "https://api.example.com/path/a%25b=b%25a",
    );

    assertEquals(
      uri`${API_URL}/${"query"}?${{ "a%b": "b%a" }}`,
      "https://api.example.com/query?a%25b=b%25a",
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
      "bool=true&other=%E2%9C%A8",
    );
  },
});

Deno.test("example", () => {
  const API_URL = "https://api.example.com/";

  const userPostsUrl = (id: string, limit: number, offset: number) => {
    return uri`${API_URL}/users/${id}/posts?${{
      limit: limit.toString(),
      offset: offset.toString(),
    }}`;
  };

  assertEquals(
    userPostsUrl("112233445566778899", 10, 5),
    "https://api.example.com/users/112233445566778899/posts?limit=10&offset=5",
  );
});

// TODO: when `deno test --doc` supports running the tests, remove this.
Deno.test("documentation", () => {
  const HOST = `https://example.com/`;

  // removed when nothing after
  assertEquals(
    uri`https://example.com/example?${null}`,
    "https://example.com/example",
  );

  // kept when something after
  assertEquals(
    uri`https://example.com/example?${{}}`,
    "https://example.com/example?",
  );

  // avoiding `?` cleanup behavior always
  assertEquals(
    uri`https://example.com/example${["?"]}${null}`,
    "https://example.com/example?",
  );

  assertEquals(
    uri`${HOST}/example`,
    "https://example.com/example",
  );

  assertEquals(
    uri`https://example.com/${"hello world?"}`,
    "https://example.com/hello%20world%3F",
  );

  assertEquals(
    uri`https://example.com/${{ foo: "bar", key: (10).toString() }}`,
    "https://example.com/foo=bar&key=10",
  );

  assertEquals(
    uri`https://example.com/${["get", "user", 120]}`,
    "https://example.com/get/user/120",
  );

  assertEquals(
    uri`https://example.com/${">///<"}`,
    "https://example.com/%3E%2F%2F%2F%3C",
  );

  assertEquals(
    uri`https://example.com/${['>///<']}`,
    'https://example.com/>///<'
  )
});
