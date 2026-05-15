import path from "node:path";

export function assertSafeRelativePath(relativePath, label = "path") {
  const value = String(relativePath || "").replaceAll("\\", "/").trim();
  if (!value) throw new Error(`${label} is empty.`);
  if (value.includes("\0")) throw new Error(`${label} contains a null byte.`);
  if (path.isAbsolute(value) || /^[A-Za-z]:\//.test(value)) {
    throw new Error(`${label} must be relative: ${relativePath}`);
  }

  const parts = value.split("/").filter(Boolean);
  if (parts.some((part) => part === "..")) {
    throw new Error(`${label} must stay inside the project: ${relativePath}`);
  }

  return parts.join("/");
}

export function resolveInside(root, relativePath, label = "path") {
  const safeRelative = assertSafeRelativePath(relativePath, label);
  const rootAbsolute = path.resolve(root);
  const target = path.resolve(rootAbsolute, safeRelative);
  assertInside(rootAbsolute, target, label);
  return target;
}

export function assertInside(root, target, label = "path") {
  const rootAbsolute = path.resolve(root);
  const targetAbsolute = path.resolve(target);
  const relative = path.relative(rootAbsolute, targetAbsolute);
  if (relative === "") return;
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside ${rootAbsolute}: ${target}`);
  }
}

export function safeBasename(value, label = "name") {
  const safe = assertSafeRelativePath(value, label);
  if (safe === "." || safe.includes("/")) {
    throw new Error(`${label} must be a single path segment: ${value}`);
  }
  return safe;
}
