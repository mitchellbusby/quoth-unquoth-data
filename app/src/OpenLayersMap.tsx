import { Map, Overlay, View } from "ol";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import { useContext, useEffect, useRef } from "react";
import { AppState } from "./AppState";
import { CreateRouteContext } from "./CreateEditRoutes";
import { FeatureType } from "./FeatureType";
import { BusStopLayer } from "./Layers/BusStopLayer";
import { PeopleLayer } from "./Layers/PeopleLayer";
import { getRouteNameFromNumber, getRouteNumberFromId } from "./utils/routes";
import { BusLayer } from "./Layers/BusLayer";

const OpenLayersMap = ({
  peopleLayer,
  appState,
}: {
  peopleLayer: PeopleLayer;
  appState: AppState;
}) => {
  const [_, dispatchCreateRouteUpdate] = useContext(CreateRouteContext);
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const olMapRef = useRef<Map>();

  useEffect(() => {
    if (!mapRef.current || !popupRef.current) {
      return;
    }
    console.log("woah nelly");

    const center = fromLonLat([149.131, -35.2802]);
    const busLayer = new BusLayer(appState);
    const layers = [new BusStopLayer(), busLayer, peopleLayer];

    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM({
            url: "https://a.tile.thunderforest.com/transport/{z}/{x}/{y}@2x.png?apikey=6170aad10dfd42a38d4d8c709a536f38",
          }),
        }),
        ...layers.map(({ layer }) => layer),
      ],
      view: new View({
        center: center,
        zoom: 15,
      }),
    });

    olMapRef.current = map;

    const popup = new Overlay({
      element: popupRef.current,
    });

    map.addOverlay(popup);
    map.on("postrender", () => {
      layers.forEach((layer) => layer.draw(appState.frameCount));
      busLayer.features;
      if (popup.get("tripId")) {
        if (busLayer.features[popup.get("tripId")]) {
          popup.setPosition(
            busLayer.features[popup.get("tripId")]
              .getGeometry()
              .getCoordinates()
          );
        } else {
          popup.setPosition(undefined);
        }
      }
      map.render();
    });

    layers.forEach((layer) => layer.draw(appState.frameCount));
    map.render();

    map.on("click", function (evt) {
      popup.setPosition(undefined);
      popup.set("tripId", undefined);
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        if (feature.get("type") === FeatureType.Bus) {
          popup.setPosition((feature.getGeometry() as Point).getCoordinates());
          const tripId = feature.get("tripId");

          const routeNumber = getRouteNumberFromId(tripId, appState.routes);

          const routeName = getRouteNameFromNumber(
            routeNumber,
            appState.routes
          );

          if (popupRef.current) {
            popupRef.current.innerText = `${routeNumber}: ${routeName}`;
          }

          popup.set("tripId", tripId);
        }

        if (feature.get("type") === FeatureType.BusStop) {
          const stopId = feature.get("stopId");
          const stopName = feature.get("stopName");
          dispatchCreateRouteUpdate({
            type: "add-stop",
            stop: { stopId, name: stopName },
          });
        }
      });
    });

    return () => {
      map.dispose();
    };
  }, []);

  useEffect(() => {
    appState.olMapRef = olMapRef;
  }, [olMapRef.current]);

  return (
    <>
      <div ref={mapRef} id="map"></div>
      <div
        id="popover"
        css={{
          background: "white",
          padding: 8,
          borderRadius: 8,
          boxShadow: "var(--shadow-elevation-low)",
        }}
        ref={popupRef}
      ></div>
    </>
  );
};

export { OpenLayersMap };
