import React, { createRef, useEffect } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { transform } from "ol/proj";
import { Coordinate } from "ol/coordinate";

const OpenLayersMap = () => {
  const mapRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new TileLayer({
          source: new OSM({
            url: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png",
            opaque: false,
          }),
        }),
      ],
      view: new View({
        center: fromLatLon([149.049675, -35.344625]),
        zoom: 15,
      }),
    });

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
