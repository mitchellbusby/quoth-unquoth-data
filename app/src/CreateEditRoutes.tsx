import { cloneDeep, remove } from "lodash";
import { fromLonLat } from "ol/proj";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useLocalStorage } from "usehooks-ts";
import { AppStateContext } from "./AppState";
import { Button } from "./components/Button";
import stops from "./data/stops.json";

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
    appState.savedBusRoutes = savedRoutes;
  }, [savedRoutes]);

  const handleFinishCreate = () => {
    const nextSavedRoutes = cloneDeep(savedRoutes);

    nextSavedRoutes.routes.push({
      name: state.routeName,
      stops: state.stops.map((m) => ({ stopId: m.stopId })),
    });

    setSavedRoutes(nextSavedRoutes);
    dispatch({ type: "finish" });
  };

  return (
    <div>
      <div>Create and edit routes</div>
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
        <div>
          <Button
            onClick={() => {
              dispatch({
                type: "start",
                routeName: `Untitled ${savedRoutes.routes.length + 1}`,
              });
            }}
          >
            Start route
          </Button>
          <div>Saved routes</div>
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
                      Delete
                    </Button>
                  </div>
                  <ol>
                    {route.stops.map((stop) => (
                      <li>
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
                          Center
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
      )}
    </div>
  );
};

function getStopLocation(stopId: number) {
  return [stops[stopId].lon, stops[stopId].lat];
}

const formatStopString = (stopId: string) =>
  `${stops[stopId].name} (${stopId})`;

export type SavedRoute = {
  stops: {
    stopId: string;
  }[];
  name: string;
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
