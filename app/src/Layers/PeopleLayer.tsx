import { range } from "lodash";
import { Coordinate, distance } from "ol/coordinate";
import Feature, { FeatureLike } from "ol/Feature";
import { Point } from "ol/geom";
import Geometry from "ol/geom/Geometry";
import { fromLonLat, toLonLat } from "ol/proj";
import { Circle, Fill, Style } from "ol/style";
import { Trip, TripCollection } from "../AppState";
import { FeatureType } from "../FeatureType";
import {
  generateCachedTripMap,
  getIntent,
  Intent,
  pathFind,
  StopCollection,
  TripTimeMap,
} from "../PeopleSim";
import { getStopLocation } from "../utils/getStopLocation";
import { AbstractLayer } from "./AbstractLayer";

export class PeopleLayer extends AbstractLayer<Geometry> {
  intents: Intent[];
  cachedTripMap: TripTimeMap;
  trips: Trip[];

  sample = 100;

  constructor(routes: TripCollection, stops: StopCollection) {
    super();
    this.refresh(routes, stops);
  }

  refresh(routes: TripCollection, stops: StopCollection) {
    const peopleCount = range(0, this.sample);
    this.cachedTripMap = generateCachedTripMap(routes, stops);
    this.intents = peopleCount.map((id) => getIntent(id));
    this.trips = this.intents
      .map((intent) => {
        const path = pathFind(intent, routes, stops, this.cachedTripMap);
        if (!path) {
          return;
        }
        const startTime =
          intent.arrivalTime - path.times.reduce((a, b) => a + b, 0);
        return { ...path, times: path.times.map((time) => startTime + time) };
      })
      .filter((x) => x) as Trip[];
    console.log(this.trips);
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
