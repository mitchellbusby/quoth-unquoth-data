import busTrips from "./data/stop_times.json";
/**
 * Gets all trips, and return wrapped values.
 */
const getProcessedStops = () => {
  return Object.fromEntries(
    Object.entries(busTrips).map(([tripId, { stops, times }]) => {
      const newTimes = [];
      let prevTime = undefined;
      for (let t of times) {
        if (t <= 3 * 60 * 60) {
          t += 24 * 60 * 60;
        }
        if (prevTime !== undefined && prevTime === t) {
          newTimes.push(t + 25 + Math.random() * 10);
        } else {
          newTimes.push(t - Math.random() * 30);
        }
        prevTime = t;
      }
      return [tripId, { stops, times: newTimes }];
    })
  );
};

const processedStops = getProcessedStops();

export { processedStops as preProcessedStops };
