export function sortByTitle<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.title.localeCompare(b.title, "vi", { numeric: true, sensitivity: "base" })
  );
}
