import routes from "../data/routes.json";

export const getRouteNumberFromId = (id: string) => {
  if (!routes.trips[id]) {
    throw new Error("Route ID not found in routes.json");
  }
  return routes.trips[id].route;
};
