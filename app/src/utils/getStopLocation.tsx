import stops from "../data/stops.json";

export function getStopLocation(stopId: number) {
  return [stops[stopId].lon, stops[stopId].lat];
}
