import React, { createRef, useEffect } from "react";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { transform } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import Heatmap from "ol/layer/Heatmap";
import VectorSource from "ol/source/Vector";
import { MultiPoint, Point } from "ol/geom";
import { getVectorContext } from "ol/render";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Style, Circle, Icon } from "ol/style";
import CircleStyle from "ol/style/Circle";

import busRoutes from "./data/stop_times.json";
import stops from "./data/stops.json";

function interpolate(a: Coordinate, b: Coordinate, frac: number) {
  var nx = a[0] + (b[0] - a[0]) * frac;
  var ny = a[1] + (b[1] - a[1]) * frac;
  return [nx, ny];
}

function getStopLocation(stopId: number) {
  return [stops[stopId].lon, stops[stopId].lat];
}

const OpenLayersMap = () => {
  const mapRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const center = fromLatLon([149.049675, -35.344625]);

    const buses = new TileLayer({
      source: new OSM({
        url: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png",
        opaque: false,
      }),
    });

    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        buses,
      ],
      view: new View({
        center: center,
        zoom: 15,
      }),
    });

    const n = 200;
    const omegaTheta = 30000; // Rotation period in ms
    const R = 7e6;
    const r = 2e6;
    const p = 2e6;

    const imageStyle = new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: "yellow" }),
        stroke: new Stroke({ color: "red", width: 1 }),
      }),
    });

    let framecount = 0;

    buses.on("postrender", (event) => {
      const vectorContext = getVectorContext(event);
      const frameState = event.frameState;
      const theta = (2 * Math.PI * (frameState?.time || 0)) / omegaTheta;
      const coordinates = Object.entries(busRoutes)
        .map(([route, { stops, times }]) => {
          const where = times.filter((time) => framecount >= time);
          if (where.length > 0 && where.length < times.length) {
            const [startTime, endTime] = [
              times[where.length - 1],
              times[where.length],
            ];
            const [startLoc, endLoc] = [
              getStopLocation(stops[where.length - 1]),
              getStopLocation(stops[where.length]),
            ];
            return fromLatLon(
              interpolate(
                startLoc,
                endLoc,
                (framecount - startTime) / (endTime - startTime)
              )
            );
          }
          return undefined;
        })
        .filter((x) => x);

      vectorContext.setStyle(imageStyle);
      vectorContext.drawGeometry(new MultiPoint(coordinates));

      map.render();
      framecount = (framecount + 1) % (24 * 60 * 60);
    });
    map.render();

    return () => {
      map.dispose();
    };
  }, [mapRef.current]);

  return <div ref={mapRef} id="map"></div>;
};

const fromLatLon = (coordinates: Coordinate, opt_projection?: string) => {
  return transform(
    coordinates,
    "EPSG:4326",
    opt_projection !== undefined ? opt_projection : "EPSG:3857"
  );
};
export { OpenLayersMap };
