# Mouri (もURI)

A simple, easy to use, and relatively performant (see [benchmarks](#benchmarks))
way to create and join uri parts together.

Please note that this is not meant to handle many edge cases, and is meant and
made for simple use cases.

# Usage
- [**Documentation**](https://doc.deno.land/https/deno.land/x/mouri/uri.ts)
- [**Examples**](./examples/README.md)

## Deno
```ts
import { assertEquals } from "https://deno.land/std@0.122.0/testing/asserts.ts";
import uri from "https://deno.land/x/mouri/mod.ts";

const API_URL = "https://api.example.com/";

const userPostsUrl = (id: string, limit: number, offset: number) => {
  return uri`${API_URL}/users/${id}/posts?${{ limit, offset }}`;
};

assertEquals(
  userPostsUrl("112233445566778899", 10, 5),
  "https://api.example.com/users/112233445566778899/posts?limit=10&offset=5",
);
```

## Node

`> npm i mouri`

```js
import { strict as assert } from 'assert';
import uri from 'mouri';

const API_URL = "https://api.example.com/";

const userPostsUrl = (id, limit, offset) => {
  return uri`${API_URL}/users/${id}/posts?${{ limit, offset }}`;
};

assert.strictEqual(
  userPostsUrl("112233445566778899", 10, 5),
  "https://api.example.com/users/112233445566778899/posts?limit=10&offset=5"
);
```

# Benchmarks

To run: `deno run .\bench.ts`

<!-- BENCHMARKS START -->
## Simple URL joining


pattern:
> `{API_URL}/users/{id}/posts/limit={limit}&offset={offset}`

expected result:
> `https://api.example.com/users/112233445566778899/posts/limit=10&offset=5`
            
|Name|Runs|Total (ms)|Average (ms)|
|:--|--:|--:|--:|
|mouri|2000|12.058|0.006|
|urlcat|2000|37.778|0.019|
|handwritten|2000|46.136|0.023|
<!-- BENCHMARKS END -->
