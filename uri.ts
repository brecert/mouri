type ParamValue =
  | string
  | number
  | boolean
  | unknown[]
  | string[][]
  | Record<string, string>
  | URLSearchParams
  | undefined
  | null;

/**
 * Removes the first and/or last character of a string if the character is a `/`.
 *
 * Returns the input given if it is not a string, otherwise it trims the string.
 *
 * _returning the input given instead of only allowing strings to be inputted through typescript is used for performance gains_
 */
export const trimSlashes = <T extends ParamValue>(input: T) => {
  if (typeof input !== "string") return input;

  const stripFirst = input[0] === "/";
  const stripLast = input[input.length - 1] === "/";
  if (stripLast || stripFirst) {
    // typescript doesn't allow implicit conversion here
    // `bool ^ 0` is about the fastest way to convert currently
    // although `+bool` could be used for clarity in the future
    // `Number(bool)` is very slow and should be avoided.
    return input.slice(
      (stripFirst as unknown as number) ^ 0,
      input.length - (stripLast as unknown as number) ^ 0,
    );
  } else {
    return input;
  }
};

/**
 * @private
 * Encodes an object into a query string
 */
export const encodeURLQueryString = (params: Record<string, string>) =>
  Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

// TODO: test nested if performance compared to this
/** @private */
export const convertValue = (value: ParamValue) => {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join("/");
  if (typeof value === "object") {
    if (value instanceof URLSearchParams) {
      return value;
    } else {
      return encodeURLQueryString(value);
    }
  } else {
    return encodeURIComponent(value);
  }
};

/**
 * Joins together values in a way that makes writing urls easier.
 *
 * # Usage
 *
 * ## starting string
 * At the beginning of the template, if a string is inserted with nothing before it,
 * the string is inserted without any encoding applied to it.
 *
 * If a foward slash `/` is the first or last character in the starting string, it will be removed..
 * ```js
 * # import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts"
 * # import { uri } from './uri.ts'
 *
 * const HOST = `https://example.com/`
 * assertEquals(
 *   uri`${HOST}/example`,
 *   'https://example.com/example'
 * )
 * ```
 * 
 * ## ending `?` cleanup
 * if the template string ends with a `?` 
 * then the ? will be removed if there is no content after it.
 * 
 * ```js
 * # import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts"
 * # import { uri } from './uri.ts'
 *
 * // removed when nothing after
 * assertEquals(
 *   uri`https://example.com/example?${null}`,
 *   'https://example.com/example'
 * )
 * 
 * // kept when something after
 * assertEquals(
 *   uri`https://example.com/example?${{}}`,
 *   'https://example.com/example?'
 * )
 * 
 * // avoiding `?` cleanup behavior always
 * assertEquals(
 *   uri`https://example.com/example${['?']}${null}`,
 *   'https://example.com/example?'
 * )
 * ```
 *
 * ## strings, numbers, and booleans
 * strings are transformed using `encodeURIComponent`
 * ```js
 * # import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts"
 * # import { uri } from './uri.ts'
 *
 * assertEquals(
 *   uri`https://example.com/${'hello world?'}`,
 *   'https://example.com/hello%20world%3F'
 * )
 * ```
 *
 * ## objects
 * objects get transformed into query strings.
 * ```js
 * # import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts"
 * # import { uri } from './uri.ts'
 *
 * assertEquals(
 *   uri`https://example.com/${{ foo: 'bar', key: (10).toString() }}`,
 *   'https://example.com/foo=bar&key=10'
 * )
 * ```
 *
 * ## arrays
 * arrays are joined with `/` with no other special transformations applied.
 * ```js
 * # import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts"
 * # import { uri } from './uri.ts'
 *
 * assertEquals(
 *   uri`https://example.com/${['get', 'user', 120]}`,
 *   'https://example.com/get/user/120'
 * )
 * ```
 *
 * this can be used to avoid having your values transformed or escaped when inserting them.
 * ```js
 * # import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts"
 * # import { uri } from './uri.ts'
 *
 * // before
 * assertEquals(
 *   uri`https://example.com/${'>///<'}`,
 *  'https://example.com/%3E%2F%2F%2F%3C'
 * )
 *
 * // after
 * assertEquals(
 *   uri`https://example.com/${['>///<']}`,
 *   'https://example.com/>///<'
 * )
 * ```
 */
export const uri = (
  strings: TemplateStringsArray,
  ...keys: ParamValue[]
) => {
  let output = "";

  for (let i = 0; i < strings.length; i++) {
    let string = strings[i];
    const insert = keys[i];

    // if it's the final insert and it's an ? 
    // without anything after, skip inserting them
    if(string.endsWith('?') && insert == null) {
      string = string.slice(0, string.length - 1)
    }

    // if it's the first insert with nothing before it
    // then insert it as a BASE
    if (i === 0 && string === "") {
      output += trimSlashes(insert);
    } else {
      output += `${string}${convertValue(insert)}`;
    }
  }

  return output;
};

export default uri;