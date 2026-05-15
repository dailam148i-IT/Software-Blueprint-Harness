export function parseSimpleYaml(text) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const indent = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].value;

    if (line === "-" || line.startsWith("- ")) {
      if (!Array.isArray(parent)) continue;
      const rest = line === "-" ? "" : line.slice(2).trim();
      if (!rest) {
        const child = nextContainer(lines, index, indent);
        parent.push(child);
        stack.push({ indent, value: child });
        continue;
      }

      const objectItemMatch = rest.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
      if (objectItemMatch) {
        const child = {};
        parent.push(child);
        const key = objectItemMatch[1];
        const rawValue = (objectItemMatch[2] || "").trim();
        assignYamlValue(child, key, rawValue, lines, index, indent, stack);
        if (rawValue !== "") {
          stack.push({ indent, value: child });
        }
        continue;
      }

      parent.push(parseScalar(rest));
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    assignYamlValue(parent, key, rawValue, lines, index, indent, stack);
  }

  return root;
}

export function stringifySimpleYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (Array.isArray(item) || (item && typeof item === "object")) {
          return `${pad}-\n${stringifySimpleYaml(item, indent + 2)}`;
        }
        return `${pad}- ${formatScalar(item)}`;
      })
      .join("\n");
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

function assignYamlValue(parent, key, rawValue, lines, index, indent, stack) {
  if (!parent || typeof parent !== "object") return;

  if (rawValue === "[]") {
    parent[key] = [];
    stack.push({ indent, value: parent[key] });
    return;
  }

  if (rawValue === "{}") {
    parent[key] = {};
    stack.push({ indent, value: parent[key] });
    return;
  }

  if (rawValue === "") {
    parent[key] = nextContainer(lines, index, indent);
    stack.push({ indent, value: parent[key] });
    return;
  }

  parent[key] = parseScalar(rawValue);
}

function nextContainer(lines, index, indent) {
  const next = nextMeaningfulLine(lines, index + 1);
  if (next && next.indent > indent && next.line.startsWith("-")) return [];
  return {};
}

function nextMeaningfulLine(lines, start) {
  for (let index = start; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    return {
      indent: rawLine.match(/^\s*/)[0].length,
      line: rawLine.trim()
    };
  }
  return null;
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
