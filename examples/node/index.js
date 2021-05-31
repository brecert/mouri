import { strict as assert } from "assert";
import uri from "mouri";

const API_URL = "https://api.example.com/";

const userPostsUrl = (id, limit, offset) => {
  return uri`${API_URL}/users/${id}/posts?${{
    limit: limit.toString(),
    offset: offset.toString(),
  }}`;
};

const result = userPostsUrl("112233445566778899", 10, 5);

assert.strictEqual(
  result,
  "https://api.example.com/users/112233445566778899/posts?limit=10&offset=5"
);

console.log(`result:`, result);
