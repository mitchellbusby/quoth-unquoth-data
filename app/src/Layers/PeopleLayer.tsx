import { range } from "lodash";
import { Coordinate, distance } from "ol/coordinate";
import Feature, { FeatureLike } from "ol/Feature";
import { Point } from "ol/geom";
import Geometry from "ol/geom/Geometry";
import { fromLonLat, toLonLat } from "ol/proj";
import { Circle, Fill, Style } from "ol/style";
import { FeatureType } from "../FeatureType";
import { getIntent } from "../PeopleSim";
import { AbstractLayer } from "./AbstractLayer";

export class PeopleLayer extends AbstractLayer<Geometry> {
  constructor() {
    super();
    this.layer.setMinZoom(14);
  }
  getStyle(feature: FeatureLike, resolution: number): Style {
    return new Style({
      image: new Circle({
        radius: 4,
        fill: new Fill({ color: "red" }),
      }),
    });
  }

  getFeatures(currentTime?: number): Feature<Geometry>[] {
    const peopleCount = range(0, 20);

    return peopleCount
      .map((personIndex) => {
        const personData = getIntent(personIndex);
        const {
          // todo: switch these when I'm done testing
          departureTime,
          arrivalTime,
          source: startLoc,
          destination: endLoc,
        } = personData;

        /**
         * get distance between source and destination
         * (could use open layers for this)
         * multiply it by some number
         * then back track to get the time to leave for arrival,
         * and forward track to get time to arrive for departure
         */

        let lerpedCoordinate;

        const tripToDestination = {
          startTime: arrivalTime - distance(startLoc, endLoc) * 10000,
          endTime: arrivalTime,
        };

        if (
          currentTime <= tripToDestination.endTime &&
          currentTime >= tripToDestination.startTime
        ) {
          const { startTime, endTime } = tripToDestination;
          // we can do a lerp
          lerpedCoordinate = fromLonLat(
            interpolate(
              startLoc,
              endLoc,
              (currentTime - startTime) / (endTime - startTime)
            )
          );
        }
        // add return trip

        // console.log(startTime, endTime, currentTime);

        // if (currentTime >= endTime || currentTime <= startTime) {
        //   return undefined;
        // }

        // // start with arriving at the destination

        // const lerpedCoordinate = fromLonLat(
        //   interpolate(
        //     startLoc,
        //     endLoc,
        //     (currentTime - startTime) / (endTime - startTime)
        //   )
        // );

        if (!lerpedCoordinate) {
          return;
        }

        console.log("person drawn!!!!", currentTime);

        const personFeature = new Feature({
          geometry: new Point(lerpedCoordinate),
          type: FeatureType.Person,
        });

        return personFeature;
      })
      .filter((x) => x);
  }
}

function interpolate(a: Coordinate, b: Coordinate, frac: number) {
  var nx = a[0] + (b[0] - a[0]) * frac;
  var ny = a[1] + (b[1] - a[1]) * frac;
  return [nx, ny];
}
