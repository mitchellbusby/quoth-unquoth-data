import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Icon } from "ol/style";

import { AbstractLayer } from "./AbstractLayer";

import stops from "../data/stops.json";
import BusStop from "../static/stop.png";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { FeatureType } from "../FeatureType";
import { fromLonLat } from "ol/proj";
import { getStopLocation } from "../utils/getStopLocation";

export class BusStopLayer extends AbstractLayer<Geometry> {
  constructor() {
    super();

    this.layer.setMinZoom(14);
  }

  getStyle() {
    return new Style({
      image: new Icon({ src: BusStop, opacity: 0.8, scale: 0.8 }),
    });
  }

  getFeatures() {
    return Object.fromEntries(
      Object.keys(stops).map((stop) => {
        const stopLocation = getStopLocation(parseInt(stop));
        const stopName = stops[stop].name;

        return [
          stop,
          new Feature({
            geometry: new Point(fromLonLat(stopLocation)),
            type: FeatureType.BusStop,
            stopId: stop,
            stopName,
          }),
        ];
      })
    );
  }
}
