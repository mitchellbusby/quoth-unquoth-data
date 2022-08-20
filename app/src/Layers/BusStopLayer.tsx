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

    this.source = new VectorSource();
    this.layer = new VectorLayer({
      source: this.source,
      style: this.getStyle,
      minZoom: 14,
    });
  }

  getStyle() {
    const scaleValue = 2;
    return new Style({
      image: new Icon({ src: BusStop, scale: scaleValue }),
    });
  }

  draw() {
    const features = Object.keys(stops).map((stop) => {
      const stopLocation = getStopLocation(parseInt(stop));
      const stopName = stops[stop].name;

      return new Feature({
        geometry: new Point(fromLonLat(stopLocation)),
        type: FeatureType.BusStop,
        stopId: stop,
        stopName,
      });
    });
    this.source.addFeatures(features);
  }
}
