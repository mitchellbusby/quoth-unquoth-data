import React, { createRef, useEffect, useState } from "react";
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
import { TimeOfDay } from "./TimeOfDay";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const specialDays = ["Saturday", "Sunday"];
const secondsInADay = 24 * 60 * 60;
const secondsInAWeek = 7 * secondsInADay;

function interpolate(a: Coordinate, b: Coordinate, frac: number) {
  var nx = a[0] + (b[0] - a[0]) * frac;
  var ny = a[1] + (b[1] - a[1]) * frac;
  return [nx, ny];
}

function getStopLocation(stopId: number) {
  return [stops[stopId].lon, stops[stopId].lat];
}

let framecount;

const OpenLayersMap = () => {
  const mapRef = createRef<HTMLDivElement>();
  const [timeOfDay, setTimeOfDay] = useState<number>(0);
  useEffect(() => {
    framecount = timeOfDay;
  }, [timeOfDay]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const center = fromLonLat([149.131, -35.2802]);

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

    const imageStyle = new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: "yellow" }),
        stroke: new Stroke({ color: "red", width: 1 }),
      }),
    });

    buses.on("postrender", (event) => {
      const timeOfDay = framecount;
      const vectorContext = getVectorContext(event);
      const coordinates = Object.entries(busRoutes)
        .map(([, { stops, times }]) => {
          const where = times.filter((time) => timeOfDay >= time);
          if (where.length > 0 && where.length < times.length) {
            const [startTime, endTime] = [
              times[where.length - 1],
              times[where.length],
            ];
            const [startLoc, endLoc] = [
              getStopLocation(stops[where.length - 1]),
              getStopLocation(stops[where.length]),
            ];
            return fromLonLat(
              interpolate(
                startLoc,
                endLoc,
                (timeOfDay - startTime) / (endTime - startTime)
              )
            );
          }
          return undefined;
        })
        .filter((x) => x);

      vectorContext.setStyle(imageStyle);
      vectorContext.drawGeometry(new MultiPoint(coordinates));

      map.render();
      setTimeOfDay((timeOfDay) => (timeOfDay + 1) % (24 * 60 * 60));
    });
    map.render();

    return () => {
      map.dispose();
    };
  }, [mapRef.current]);

  return (
    <>
      <div ref={mapRef} id="map"></div>
      <TimeOfDay seconds={timeOfDay}></TimeOfDay>
    </>
  );
};

const fromLonLat = (coordinates: Coordinate, opt_projection?: string) => {
  return transform(
    coordinates,
    "EPSG:4326",
    opt_projection !== undefined ? opt_projection : "EPSG:3857"
  );
};
export { OpenLayersMap };
