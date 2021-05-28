// deno run --allow-write --allow-read --allow-hrtime ./bench.ts update-readme

import {
  bench,
  runBenchmarks,
} from "https://deno.land/std@0.97.0/testing/bench.ts";

import {
  defaultColumns,
  prettyBenchmarkDown,
  prettyBenchmarkProgress,
  prettyBenchmarkResult,
} from "https://deno.land/x/pretty_benching@v0.3.3/mod.ts";

import uri from "./uri.ts";
import jspmUrlcat from "https://jspm.dev/urlcat";
const urlcat = (jspmUrlcat as any).default;

const API_URL = "https://api.example.com/";
const id = "112233445566778899";
const limit = 5;
const offset = 5;

const RUNS = 1000;

bench({
  name: "mouri",
  runs: RUNS,
  func(b): void {
    b.start();
    uri`${API_URL}/users/${id}/posts/${{
      limit: limit.toString(),
      offset: offset.toString(),
    }}`;
    b.stop();
  },
});

bench({
  name: "urlcat",
  runs: RUNS,
  func(b): void {
    b.start();
    urlcat(API_URL, "/users/:id/posts", { id, limit, offset });
    b.stop();
  },
});

bench({
  name: "handwritten",
  runs: RUNS,
  func(b): void {
    b.start();

    const escapedId = encodeURIComponent(id);
    const path = `/users/${escapedId}`;
    const url = new URL(path, API_URL);
    url.search = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    }).toString();
    url.href;
    b.stop();
  },
});

runBenchmarks(
  { silent: true },
  prettyBenchmarkProgress({}),
)
  .then(
    prettyBenchmarkResult({
      parts: {
        extraMetrics: true,
      },
    }),
  )
  .then(
    prettyBenchmarkDown(
      (markdown) => {
        if (Deno.args[0] === "update-readme") {
          const readme = Deno.readTextFileSync("./README.md");
          const modifiedReadme = readme.replace(
            /(<!-- BENCHMARKS START -->)[^]+(<!-- BENCHMARKS END -->)/g,
            `$1\n${markdown.trim()}\n$2`,
          );

          Deno.writeTextFileSync("./README.md", modifiedReadme);
        }
      },
      {
        groups: [
          {
            include: /.+/,
            name: "Simple URL joining",
            description: `
pattern:
> \`{API_URL}/users/{id}/posts/limit={limit}&offset={offset}\`

expected result:
> \`https://api.example.com/users/112233445566778899/posts/limit=10&offset=5\`
            `,
            columns: [
              ...defaultColumns(),
            ],
          },
        ],
      },
    ),
  )
  .catch((e: any) => {
    console.error(e.stack);
  });
