export const getRouteNumberFromId = (id: string, routes: any) => {
  if (!routes.trips[id]) {
    throw new Error("Route ID not found in routes.json");
  }
  return routes.trips[id].route;
};

export const getRouteNameFromNumber = (number: string, routes: any) => {
  if (!routes.routes[number]) {
    throw new Error("Route ID not found in routes.json");
  }

  const values = routes.routes[number];

  if (!values["0"]) {
    return values["1"];
  }

  return `${values["0"]} to ${values["1"]}`;
};
