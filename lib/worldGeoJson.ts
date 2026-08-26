import type { WorldGeoJson } from "@/types/game";

let cache: Promise<WorldGeoJson> | null = null;

export function getWorldGeoJson(): Promise<WorldGeoJson> {
  if (!cache) {
    cache = fetch("/data/world.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load world.geojson: ${response.status}`);
        }
        return response.json() as Promise<WorldGeoJson>;
      })
      .catch((error) => {
        cache = null;
        throw error;
      });
  }
  return cache;
}

export function getCountryNames(data: WorldGeoJson): string[] {
  return data.features
    .map((feature) => feature.properties.name)
    .filter((name): name is string => Boolean(name));
}
