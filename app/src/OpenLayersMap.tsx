import React, { createRef, useContext, useEffect, useState } from "react";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { transform } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import VectorSource from "ol/source/Vector";
import { Point } from "ol/geom";
import { Style, Icon } from "ol/style";

import busRoutes from "./data/stop_times.json";
import stops from "./data/stops.json";
import VectorLayer from "ol/layer/Vector";
import { AppStateContext } from "./AppState";
import { getBusStyle } from "./getBusStyle";
import BusStop from "./static/stop.png";

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

const busStopStyle = new Style({ image: new Icon({ src: BusStop }) });

function interpolate(a: Coordinate, b: Coordinate, frac: number) {
  var nx = a[0] + (b[0] - a[0]) * frac;
  var ny = a[1] + (b[1] - a[1]) * frac;
  return [nx, ny];
}

function getStopLocation(stopId: number) {
  return [stops[stopId].lon, stops[stopId].lat];
}

const OpenLayersMap = () => {
  const appState = useContext(AppStateContext);
  const mapRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const center = fromLonLat([149.131, -35.2802]);

    const busesSource = new VectorSource();
    const busesLayer = new VectorLayer({
      source: busesSource,
      style: (feature) => {
        const properties = feature.getProperties();
        if (properties.type === "bus") {
          let style = getBusStyle(properties);

          return style;
        }
      },
    });

    const busStopSource = new VectorSource();
    const busStopLayer = new VectorLayer({
      source: busStopSource,
      style: busStopStyle,
      minZoom: 14,
    });

    const osmCyclingLayer = new TileLayer({
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
        osmCyclingLayer,
        busStopLayer,
        busesLayer,
      ],
      view: new View({
        center: center,
        zoom: 15,
      }),
    });

    const drawAnimatedBusesFrame = () => {
      const timeOfDay = appState.frameCount;

      const coordinates = Object.entries(busRoutes)
        .map(([tripId, { stops, times }]) => {
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
            return {
              coordinate: fromLonLat(
                interpolate(
                  startLoc,
                  endLoc,
                  (timeOfDay - startTime) / (endTime - startTime)
                )
              ),
              direction: Math.atan2(
                endLoc[1] - startLoc[1],
                endLoc[0] - startLoc[0]
              ),
              tripId,
            };
          }
          return undefined;
        })
        .filter((x) => x);

      busesSource.clear();
      busesSource.addFeatures(
        coordinates.map(
          (m) =>
            new Feature({
              geometry: new Point(m.coordinate),
              orientation: m.direction,
              type: "bus",
              tripId: m.tripId,
            })
        )
      );
    };

    const drawBusStopLayer = () => {
      const coordinates = Object.keys(stops).map((stop) => {
        return getStopLocation(parseInt(stop));
      });
      busStopSource.addFeatures(
        coordinates.map(
          (m) =>
            new Feature({
              geometry: new Point(fromLonLat(m)),
            })
        )
      );
    };

    busesLayer.on("postrender", (event) => {
      drawAnimatedBusesFrame();
      map.render();
    });

    drawBusStopLayer();
    drawAnimatedBusesFrame();
    map.render();

    return () => {
      map.dispose();
    };
  }, [mapRef.current]);

  return (
    <>
      <div ref={mapRef} id="map"></div>
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
