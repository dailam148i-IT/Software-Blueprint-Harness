export function parseSimpleYaml(text) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const indent = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].value;

    if (line.startsWith("- ")) {
      if (!Array.isArray(parent)) continue;
      parent.push(parseScalar(line.slice(2).trim()));
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();

    if (rawValue === "[]") {
      parent[key] = [];
      stack.push({ indent, value: parent[key] });
    } else if (rawValue === "{}") {
      parent[key] = {};
      stack.push({ indent, value: parent[key] });
    } else if (rawValue === "") {
      parent[key] = [];
      stack.push({ indent, value: parent[key] });
    } else {
      parent[key] = parseScalar(rawValue);
    }
  }

  return root;
}

export function stringifySimpleYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    return value.map((item) => `${pad}- ${formatScalar(item)}`).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        if (Array.isArray(item)) {
          return `${pad}${key}:\n${stringifySimpleYaml(item, indent + 2)}`;
        }
        if (item && typeof item === "object") {
          return `${pad}${key}:\n${stringifySimpleYaml(item, indent + 2)}`;
        }
        return `${pad}${key}: ${formatScalar(item)}`;
      })
      .join("\n");
  }
  return `${pad}${formatScalar(value)}`;
}

function parseScalar(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value.replace(/^["']|["']$/g, "");
}

function formatScalar(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return String(value);
}
