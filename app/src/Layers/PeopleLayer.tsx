import { Coordinate } from "ol/coordinate";
import Feature, { FeatureLike } from "ol/Feature";
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

function doAsync<T>(x: () => T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const val = x();
      resolve(val);
    }, 1);
  });
}

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
        const startTime =
          intent.arrivalTime - path.times.reduce((a, b) => a + b, 0);
        this.intents.push(intent);
        this.trips.push({
          ...path,
          times: path.times.map((time) => startTime + time),
        });
      }
    }
  }

  getStyle(feature: FeatureLike, resolution: number): Style {
    return new Style({
      image: new Circle({
        radius: 5,
        fill: new Fill({ color: "red" }),
      }),
    });
  }

  getFeatures(currentTime?: number): Feature<Geometry>[] {
    if (!currentTime) {
      return [];
    }
    return this.trips
      .map(({ stops, times }) => {
        const where = times.filter((time) => currentTime >= time);
        if (where.length > 0 && where.length < times.length) {
          const [startTime, endTime] = [
            times[where.length - 1],
            times[where.length],
          ];
          const [startLoc, endLoc] = [
            getStopLocation(stops[where.length - 1]),
            getStopLocation(stops[where.length]),
          ];

          const lerpedCoordinate = fromLonLat(
            interpolate(
              startLoc,
              endLoc,
              (currentTime - startTime) / (endTime - startTime)
            )
          );

          return new Feature({
            geometry: new Point(lerpedCoordinate),
            type: FeatureType.Person,
          });
        }
        return undefined;
      })
      .filter((x) => x) as Feature<Point>[];
  }
}

function interpolate(a: Coordinate, b: Coordinate, frac: number) {
  var nx = a[0] + (b[0] - a[0]) * frac;
  var ny = a[1] + (b[1] - a[1]) * frac;
  return [nx, ny];
}
