import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cloneDeep, remove, sum } from "lodash";
import { Coordinate, distance } from "ol/coordinate";
import { fromLonLat } from "ol/proj";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useLocalStorage } from "usehooks-ts";
import { AppStateContext, Trip } from "./AppState";
import { Button } from "./components/Button";
import stops from "./data/stops.json";
import { preProcessedStops } from "./processedTrips";

function generateTrips(route: SavedRoute): { [tripId: string]: Trip } {
  const tripSegments = route.stops
    .slice(1)
    .map(({ stopId }, idx) => [
      parseInt(route.stops[idx].stopId),
      parseInt(stopId),
    ]);
  const tripDurations = tripSegments.map(([startId, stopId]) => {
    const d = distance(getStopLocation(startId), getStopLocation(stopId));
    return 15 + Math.ceil(Math.random() * 5) + d * 50000;
  });
  const totalDuration = sum(tripDurations);
  const startTime = 8 * 60 * 60;
  let trips = [];
  if (route.stops[0].stopId === route.stops[route.stops.length - 1].stopId) {
    // Loop line!
    const possibleTrips = Math.ceil((24 * 60 * 60 - startTime) / totalDuration);
    let now = startTime;
    for (let i = 0; i < possibleTrips; i++) {
      trips.push({
        stops: route.stops.map(({ stopId }) => stopId),
        times: tripDurations.reduce(
          (acc, duration) => [...acc, acc[acc.length - 1] + duration],
          [now]
        ),
      });
      now += totalDuration + 10;
    }
  } else {
    // Return trips
    const possibleTrips = Math.ceil((12 * 60 * 60 - startTime) / totalDuration);
    let now = startTime;
    let stops = [...route.stops];
    let times = [...tripDurations];
    for (let i = 0; i < possibleTrips; i++) {
      trips.push({
        stops: stops.map(({ stopId }) => stopId),
        times: times.reduce(
          (acc, duration) => [...acc, acc[acc.length - 1] + duration],
          [now]
        ),
      });
      now += totalDuration + 10;
      stops.reverse();
      times.reverse();
      trips.push({
        stops: stops.map(({ stopId }) => stopId),
        times: times.reduce(
          (acc, duration) => [...acc, acc[acc.length - 1] + duration],
          [now]
        ),
      });
      stops.reverse();
      times.reverse();
      now += totalDuration + 10;
    }
  }
  return Object.fromEntries(
    trips.map((trip, idx) => [
      `Generated-${route.name}-${idx}-Weekday-06`,
      trip,
    ])
  );
}

const CreateEditRoutes = () => {
  const appState = useContext(AppStateContext);
  const [state, dispatch] = useContext(CreateRouteContext);
  const [savedRoutes, setSavedRoutes] = useLocalStorage<{
    routes: SavedRoute[];
  }>("savedroutes", {
    routes: [],
  });

  useEffect(() => {
    // Ensure saved routes are synced to the app states
    appState.savedBusRoutes = {
      routes: savedRoutes.routes,
      trips: savedRoutes.routes.map((route) => generateTrips(route)),
    };

    console.log(appState.savedBusRoutes);
    // todo: when I have generated trips, pre processed trips get smashed together
    // with them.
    appState.processedStops = {
      ...preProcessedStops,
      ...appState.savedBusRoutes.trips.reduce((a, b) => ({ ...a, ...b }), {}),
    };
  }, [savedRoutes]);

  const handleFinishCreate = () => {
    if (state.stops.length > 0) {
      const nextSavedRoutes = cloneDeep(savedRoutes);

      nextSavedRoutes.routes.push({
        name: state.routeName,
        stops: state.stops.map((m) => ({ stopId: m.stopId })),
      });

      setSavedRoutes(nextSavedRoutes);
    }

    dispatch({ type: "finish" });
  };

  return (
    <div>
      {state ? (
        <div>
          <div>Creating route {state.routeName}</div>
          <div>Current stops:</div>
          <div>
            <ol>
              {state.stops.map((stop) => (
                <li key={stop.stopId}>
                  Stop {stop.name} ({stop.stopId}){" "}
                  <Button
                    onClick={() => {
                      dispatch({ type: "remove-stop", stopId: stop.stopId });
                    }}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ol>
          </div>
          <div
            css={{
              display: "flex",
              gap: "4px",
            }}
          >
            <Button onClick={handleFinishCreate}>Finish route</Button>
            <Button
              onClick={() => {
                dispatch({ type: "cancel" });
              }}
            >
              Cancel route
            </Button>
          </div>
        </div>
      ) : (
        <div
          css={{
            display: "grid",
            gap: 8,
          }}
        >
          <div
            css={{
              display: "flex",
            }}
          >
            <div>Custom routes</div>
            <Button
              onClick={() => {
                dispatch({
                  type: "start",
                  routeName: `Untitled ${savedRoutes.routes.length + 1}`,
                });
              }}
              css={{
                marginLeft: "auto",
              }}
            >
              Create route
            </Button>
          </div>
          <div
            css={{
              fontSize: 14,
            }}
          >
            {savedRoutes.routes.length > 0 ? (
              <div>
                {savedRoutes.routes.map((route) => (
                  <div key={route.name}>
                    <div>
                      {route.name}{" "}
                      <Button
                        onClick={() => {
                          const nextSavedRoutes = cloneDeep(savedRoutes);
                          remove(
                            nextSavedRoutes.routes,
                            (r) => r.name === route.name
                          );
                          setSavedRoutes(nextSavedRoutes);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                    <ol>
                      {route.stops.map((stop) => (
                        <li key={stop.stopId}>
                          {formatStopString(stop.stopId)}{" "}
                          <Button
                            onClick={() => {
                              const stopLatLon = getStopLocation(
                                parseInt(stop.stopId)
                              );
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
                    </ol>
                  </div>
                ))}
              </div>
            ) : (
              <div>No routes saved</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function getStopLocation(stopId: number): Coordinate {
  return [stops[stopId].lon, stops[stopId].lat];
}

const formatStopString = (stopId: string) =>
  `${stops[stopId].name} (${stopId})`;

export type SavedRoute = {
  stops: {
    stopId: string;
  }[];
  name: string;
  // number: string;
  /**
   * todo: align fields to be with what the rest of the app has:
   * - bus frequency support
   * - start / end times support
   */
};

type CreatedRoute = {
  stops: {
    stopId: string;
    name: string;
  }[];
  routeName: string;
};

type CreateRouteAction =
  | {
      type: "finish" | "cancel";
    }
  | { type: "start"; routeName?: string }
  | { type: "add-stop"; stop: { stopId: string; name: string } }
  | { type: "remove-stop"; stopId: string };

export function createRouteReducer(
  state: CreateRouteState,
  action: CreateRouteAction
): CreatedRoute | undefined {
  switch (action.type) {
    case "start": {
      return {
        stops: [],
        routeName: action.routeName ?? `Untitled route`,
      };
    }
    case "add-stop": {
      if (!state) {
        return undefined;
      }
      const stops = [...state.stops];
      stops.push(cloneDeep(action.stop));
      return {
        ...state,
        stops,
      };
    }
    case "remove-stop": {
      const stops = [...state.stops];
      remove(stops, (v) => v.stopId === action.stopId);
      return { ...state, stops };
    }
    case "finish": {
      // use finished value
      return undefined;
    }
    case "cancel": {
      return undefined;
    }
  }
}

type CreateRouteState = CreatedRoute | undefined;

const CreateRouteContext =
  createContext<[CreateRouteState, React.Dispatch<CreateRouteAction>]>(
    undefined
  );

export { CreateEditRoutes, CreateRouteContext };
