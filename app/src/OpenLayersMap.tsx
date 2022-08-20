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
import Bus from "./static/bus.png";
import RightBus from "./static/right-bus.png";
import OldBus from "./static/bus_old.png";
import RightOldBus from "./static/right-bus_old.png";
import LongBus from "./static/bus_long.png";
import RightLongBus from "./static/right-bus_long.png";
import BlueBus from "./static/bus_blue.png";
import RightBlueBus from "./static/right-bus_blue.png";
import PrideBus from "./static/bus_pride.png";
import RightPrideBus from "./static/right-bus_pride.png";

const busTypes = {
  new: {
    prob: 63,
    left: new Style({ image: new Icon({ src: Bus }) }),
    right: new Style({ image: new Icon({ src: RightBus }) }),
  },
  old: {
    prob: 23,
    left: new Style({ image: new Icon({ src: OldBus }) }),
    right: new Style({ image: new Icon({ src: RightOldBus }) }),
  },
  long: {
    prob: 8,
    left: new Style({ image: new Icon({ src: LongBus }) }),
    right: new Style({ image: new Icon({ src: RightLongBus }) }),
  },
  blue: {
    prob: 5,
    left: new Style({ image: new Icon({ src: BlueBus }) }),
    right: new Style({ image: new Icon({ src: RightBlueBus }) }),
  },
  pride: {
    prob: 1,
    left: new Style({ image: new Icon({ src: PrideBus }) }),
    right: new Style({ image: new Icon({ src: RightPrideBus }) }),
  },
};
import { AppStateContext } from "./AppState";
import BusStop from "./static/stop.png";

const busStopStyle = new Style({ image: new Icon({ src: BusStop }) });
function hashCode(value: string) {
  var hash = 0,
    i = 0,
    len = value.length;
  while (i < len) {
    hash = ((hash << 5) - hash + value.charCodeAt(i++)) << 0;
  }
  return hash;
}

const busImageStyle = new Style({
  // image: new CircleStyle({
  //   radius: 5,
  //   fill: new Fill({ color: "yellow" }),
  //   stroke: new Stroke({ color: "red", width: 1 }),
  // }),
  image: new Icon({
    src: Bus,
  }),
});

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
  const [timeOfDay, setTimeOfDay] = useState<number>(0);
  useEffect(() => {
    appState.frameCount = timeOfDay;
  }, [timeOfDay]);

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
          const roll = Math.abs(hashCode(properties.tripId) % 100);
          let cumsum = 0;
          const options = Object.keys(busTypes);
          let option = options.pop();
          while (roll > cumsum) {
            option = options.pop();
            cumsum += busTypes[option].prob;
          }
          let rotation = (2 * Math.PI - properties.orientation) % (2 * Math.PI);
          let style;
          if (rotation >= Math.PI / 2 && rotation <= (3 * Math.PI) / 2) {
            style = busTypes[option].right.clone();
            rotation += Math.PI;
          } else {
            style = busTypes[option].left.clone();
          }

          const image = style.getImage();
          image.setRotation(rotation);

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
          source: new OSM({
            url: "https://a.tile.thunderforest.com/transport/{z}/{x}/{y}@2x.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
          }),
        }),
        // osmCyclingLayer,
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
