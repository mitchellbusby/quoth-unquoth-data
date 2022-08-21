import Feature from "ol/Feature";
import { Point } from "ol/geom";
import Geometry from "ol/geom/Geometry";
import { fromLonLat } from "ol/proj";
import { Circle, Fill, Style } from "ol/style";
import { Trip, TripCollection } from "../AppState";
import { FeatureType } from "../FeatureType";
import {
  generateCachedTripMap,
  getIntents,
  Intent,
  pathFind,
  StopCollection,
} from "../PeopleSim";
import { getStopLocation } from "../utils/getStopLocation";
import { AbstractLayer } from "./AbstractLayer";
import { doAsync } from "../utils/doAsync";
import { polyLerp } from "../utils/polyLerp";

export class PeopleLayer extends AbstractLayer<Geometry> {
  intents: Intent[];
  trips: Trip[];

  sample = 10000;

  constructor(routes: TripCollection, stops: StopCollection) {
    super();
    this.intents = [];
    this.trips = [];
    setTimeout(() => this.refresh(routes, stops), 0);
  }

  async refresh(routes: TripCollection, stops: StopCollection) {
    const cachedTripMap = generateCachedTripMap(routes, stops);
    const intents = getIntents(this.sample);
    this.intents = [];
    this.trips = [];
    for (const intent of intents) {
      const path = await doAsync(() =>
        pathFind(intent, routes, stops, cachedTripMap)
      );
      if (path) {
        const tripTime = path.times[0];
        const startTime = intent.arrivalTime - tripTime;
        this.intents.push(intent);
        this.trips.push({
          ...path,
          times: path.times.map((time) => startTime + tripTime - time),
        });
      }
    }
  }

  getStyle() {
    return new Style({
      image: new Circle({
        radius: 5,
        fill: new Fill({ color: "red" }),
      }),
    });
  }

  getFeatures(currentTime?: number) {
    if (!currentTime) {
      return [];
    }
    return Object.fromEntries(
      this.trips
        .map(({ stops, times }, pid) => {
          const waypoints = stops.map((stop, idx) => ({
            location: getStopLocation(stop),
            time: times[idx],
          }));
          const currentLocation = polyLerp(waypoints, currentTime);
          if (!currentLocation) {
            return undefined;
          }

          return [
            pid,
            new Feature({
              geometry: new Point(fromLonLat(currentLocation.location)),
              type: FeatureType.Person,
            }),
          ];
        })
        .filter((x) => x)
    );
  }
}
