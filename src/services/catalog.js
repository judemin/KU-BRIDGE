import { RESOURCES, SOURCES, AUDIENCES, CATEGORIES } from "../data.js";
import { DETAILS } from "../details.js";

export { RESOURCES, SOURCES, AUDIENCES, CATEGORIES, DETAILS };

export function findTopics({
  page,
  audience,
  category,
  recommend,
  query,
  saved,
  tx,
}) {
  const search = query.trim().toLocaleLowerCase();
  return RESOURCES.filter((item) => {
    if (page === "saved" && !saved.includes(item.id)) return false;
    if (audience !== "all" && !item.audience.includes(audience)) return false;
    if (category !== "all" && item.category !== category) return false;
    if (recommend && !recommend.includes(item.id)) return false;
    if (!search) return true;
    return [
      ...Object.values(item.title),
      ...Object.values(DETAILS[item.id].description),
      ...Object.values(DETAILS[item.id].action),
      tx(item.category),
      SOURCES[item.source].name,
      item.id,
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(search);
  });
}
