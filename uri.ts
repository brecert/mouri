type ParamValue =
  | string
  | number
  | boolean
  | string[]
  | string[][]
  | Record<string, string>
  | URLSearchParams
  | undefined;

const trimSlashes = <T>(str: T) => {
  if (typeof str === "string") {
    let stripFirst = str[0] === "/";
    let stripLast = str[str.length - 1] === "/";
    if (stripLast || stripFirst) {
      // typescript doesn't allow implicit conversion here
      // `bool ^ 0` is about the fastest way to convert currently
      // although `+bool` could be used for clarity in the future
      // `Number(bool)` is very slow and should be avoided.
      return str.slice(
        (stripFirst as any) ^ 0,
        str.length - (stripLast as any) ^ 0,
      );
    } else {
      return str;
    }
  } else {
    return str;
  }
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
    let string = strings[i];
    let insert = keys[i];

    // if both are "empty" or
    // it's the final insert and it's an ? without anything after
    // skip inserting them
    if (string === "?" || string === "" && insert == null) {
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

export {
  uri,
  convertValue,
};

export default uri;
