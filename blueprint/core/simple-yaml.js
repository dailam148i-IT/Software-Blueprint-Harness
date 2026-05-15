import YAML from "yaml";

export function parseYamlDocument(text) {
  try {
    return { data: YAML.parse(text || "") ?? {}, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export function parseSimpleYaml(text) {
  const { data } = parseYamlDocument(text);
  return data && typeof data === "object" ? data : {};
}

export function stringifySimpleYaml(value) {
  return YAML.stringify(value ?? {}, {
    lineWidth: 0,
    singleQuote: false
  }).trimEnd();
}
