export const DEFAULT_CITY = "Ramallah";
export const SELECTO_CITY_STORAGE_KEY = "selecto_selected_city";

export const cities = [
  { value: "Ramallah", label: "رام الله" },
  { value: "Nablus", label: "نابلس" },
  { value: "Hebron", label: "الخليل" },
  { value: "Bethlehem", label: "بيت لحم" },
  { value: "Jerusalem", label: "القدس" },
  { value: "Jenin", label: "جنين" },
  { value: "Tulkarm", label: "طولكرم" },
  { value: "Qalqilya", label: "قلقيلية" },
  { value: "Jericho", label: "أريحا" },
] as const;

export const cityLabels = Object.fromEntries(
  cities.map((city) => [city.value, city.label]),
) as Record<string, string>;

export function getPreferredCity() {
  if (typeof window === "undefined") return DEFAULT_CITY;
  return localStorage.getItem(SELECTO_CITY_STORAGE_KEY) || DEFAULT_CITY;
}

export function setPreferredCity(city: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SELECTO_CITY_STORAGE_KEY, city);
}
