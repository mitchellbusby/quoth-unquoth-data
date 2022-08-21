import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cloneDeep, remove } from "lodash";
import { fromLonLat } from "ol/proj";
import { useContext, useState } from "react";
import { Button } from "./components/Button";
import { getStopLocation } from "./utils/getStopLocation";
import { AppStateContext } from "./AppState";

import stops from "./data/stops.json";

export const SavedRouteComponent = ({
  route,
  savedRoutes,
  setSavedRoutes,
}: {
  route: any;
  savedRoutes: any;
  setSavedRoutes: any;
}) => {
  const appState = useContext(AppStateContext);
  const [showStops, setShowStops] = useState(false);
  return (
    <div key={route.name}>
      <div
        css={{
          marginBottom: 8,
        }}
      >
        {route.name}{" "}
        <Button
          onClick={() => {
            const nextSavedRoutes = cloneDeep(savedRoutes);
            // @ts-ignore cant be bothered fixin this type
            remove(nextSavedRoutes.routes, (r) => r.name === route.name);
            setSavedRoutes(nextSavedRoutes);
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </div>
      <Button
        onClick={() => {
          setShowStops(!showStops);
        }}
      >
        {!showStops ? "Show stops" : "Hide stops"}
      </Button>
      {showStops && (
        <ul
          css={{
            paddingInlineStart: 16,
          }}
        >
          {route.stops.map((stop) => (
            <li key={stop.stopId}>
              {formatStopString(stop.stopId)}{" "}
              <Button
                onClick={() => {
                  const stopLatLon = getStopLocation(parseInt(stop.stopId));
                  appState.olMapRef?.current?.getView().animate({
                    zoom: 18,
                    center: fromLonLat(stopLatLon),
                  });
                }}
              >
                Show on map
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
const formatStopString = (stopId: string) =>
  `${stops[stopId].name} (${stopId})`;
