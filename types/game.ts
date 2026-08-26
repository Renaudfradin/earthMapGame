export type Rotation = [number, number, number];

export type GameMode = "country" | "monument";

export interface Monument {
  monument: string;
  country: string;
}

export interface CountryProperties {
  name: string;
  [key: string]: unknown;
}

export type CountryFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  CountryProperties
>;

export type WorldGeoJson = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  CountryProperties
>;
