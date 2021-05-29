type ParamValue =
  | string
  | number
  | boolean
  | string[]
  | string[][]
  | Record<string, string>
  | URLSearchParams
  | undefined;

const trimSlashes = (str: ParamValue) => {
  if (typeof str !== "string") return str;

  const stripFirst = str[0] === "/";
  const stripLast = str[str.length - 1] === "/";
  if (stripLast || stripFirst) {
    // typescript doesn't allow implicit conversion here
    // `bool ^ 0` is about the fastest way to convert currently
    // although `+bool` could be used for clarity in the future
    // `Number(bool)` is very slow and should be avoided.
    return str.slice(
      (stripFirst as unknown as number) ^ 0,
      str.length - (stripLast as unknown as number) ^ 0,
    );
  }

  return str;
};

const convertValue = (value: ParamValue) => {
  if (Array.isArray(value)) {
    return value.join("/");
  } else if (value != null) {
    if (typeof value === "object") {
      return new URLSearchParams(value);
    } else {
      return encodeURIComponent(value);
    }
  } else {
    return "";
  }
};

const uri = (
  strings: TemplateStringsArray,
  ...keys: ParamValue[]
) => {
  let output = "";

  for (let i = 0; i < strings.length; i++) {
    const string = strings[i];
    const insert = keys[i];

    // if both are "empty" or
    // it's the final insert and it's an ? without anything after
    // skip inserting them
    if ((string === "?" || string === "") && insert == null) {
      continue;
    }

    if (i === 0 && string === "") {
      output += trimSlashes(insert);
    } else {
      output += `${string}${convertValue(trimSlashes(insert))}`;
    }
  }

  return output;
};

export { convertValue, uri };

export default uri;
