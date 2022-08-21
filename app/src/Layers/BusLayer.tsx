import { Coordinate } from "ol/coordinate";
import Feature, { FeatureLike } from "ol/Feature";
import { Geometry, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { AppState } from "../AppState";
import { FeatureType } from "../FeatureType";
import { isSpecialDay } from "../timeConfiguration";
import { hashCode } from "../utils/hashCode";
import { isDefined } from "../utils/isDefined";
import { polyLerp } from "../utils/polyLerp";
import { AbstractLayer } from "./AbstractLayer";
import { busTypes } from "./busTypes";

export class BusLayer extends AbstractLayer<Point> {
  appState: AppState;
  constructor(appState: AppState) {
    super();
    console.log(appState);
    this.appState = appState;
  }

  getStyle(feature: FeatureLike) {
    const properties = feature.getProperties();
    if (properties.type === FeatureType.Bus) {
      let option: keyof typeof busTypes = "new";
      if (this.appState.busDistribution === "pride") {
        option = "pride";
      } else {
        const roll = Math.abs(hashCode(properties.tripId) % 100);
        let cumsum = 0;
        const options = Object.keys(busTypes);
        option = options.pop() as keyof typeof busTypes;
        while (roll > cumsum && options.length) {
          option = options.pop() as keyof typeof busTypes;
          cumsum += busTypes[option].prob;
        }
      }

      let rotation = (2 * Math.PI - properties.orientation) % (2 * Math.PI);
      let style;
      if (rotation >= Math.PI / 2 && rotation <= (3 * Math.PI) / 2) {
        style = busTypes[option].right.clone();
        rotation += Math.PI;
      } else {
        style = busTypes[option].left.clone();
      }

      return style;
    }
  }

  getFeatures(currentTime?: number) {
    const state = this.appState;
    const timeOfDay = state.frameCount;
    const trips = state.processedStops;

    const buses = Object.entries(trips).filter(([tripId]) => {
      // check day of the week first
      if (isSpecialDay(state.dayOfWeek)) {
        // check that it includes the specific day
        return tripId.includes(state.dayOfWeek);
      } else {
        // check if its a weekday trip
        return tripId.includes("Weekday");
      }
    });
    const coordinates: {
      coordinate: Coordinate;
      direction: number;
      tripId: string;
    }[] = buses
      .map(([tripId, { times, stopLocations }]) => {
        const waypoints = stopLocations.map((stop, idx) => ({
          location: stop,
          time: times[idx],
        }));
        const position = polyLerp(waypoints, timeOfDay);
        if (!position) return;

        const coordinate = fromLonLat(position.location);

        return {
          coordinate: coordinate,
          direction: position.direction,
          tripId,
        };
      })
      .filter(isDefined);

    return Object.fromEntries(
      coordinates.map((m) => [
        m.tripId,
        new Feature({
          geometry: new Point(m.coordinate),
          orientation: m.direction,
          type: FeatureType.Bus,
          tripId: m.tripId,
        }),
      ])
    );
  }
}
