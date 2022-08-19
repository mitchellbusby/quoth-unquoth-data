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

    buses.on("postrender", (event) => {
      const vectorContext = getVectorContext(event);
      const frameState = event.frameState;
      const theta = (2 * Math.PI * (frameState?.time || 0)) / omegaTheta;
      const coordinates: number[][] = [];
      let i;
      for (i = 0; i < n; ++i) {
        const t = theta + (2 * Math.PI * i) / n;
        const x = (R + r) * Math.cos(t) + p * Math.cos(((R + r) * t) / r);
        const y = (R + r) * Math.sin(t) + p * Math.sin(((R + r) * t) / r);
        coordinates.push([center[0] + x / 1000, center[1] + y / 1000]);
      }
      vectorContext.setStyle(imageStyle);
      vectorContext.drawGeometry(new MultiPoint(coordinates));

      map.render();
    });
    map.render();

    return () => {
      map.dispose();
    };
  }, [mapRef]);

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
