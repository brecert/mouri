import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts";
import uri from "../mod.ts";

const API_URL = "https://api.example.com/";

const userPostsUrl = (id: string, limit: number, offset: number) => {
  return uri`${API_URL}/users/${id}/posts?${{
    limit: limit.toString(),
    offset: offset.toString(),
  }}`;
};

const result = userPostsUrl("112233445566778899", 10, 5);

assertEquals(
  result,
  "https://api.example.com/users/112233445566778899/posts?limit=10&offset=5",
);

console.log("result:", result);
