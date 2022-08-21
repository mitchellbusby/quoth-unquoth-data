import { Coordinate } from "ol/coordinate";
import { interpolate } from "../utils/interpolate";

interface Waypoint {
  location: Coordinate;
  time: number;
}

function binarySearch(arr: Waypoint[], needle: number): [Waypoint, Waypoint] {
  // Given an array of at least 2 numbers, find the numbers surrounding needle.
  let [lowerBound, upperBound] = [0, arr.length - 1]; // [lowerBound, upperBound]
  while (upperBound - lowerBound > 2) {
    const partition = Math.floor((upperBound - lowerBound) / 2) + lowerBound;
    if (needle >= arr[partition].time) {
      lowerBound = partition;
    }
    if (needle <= arr[partition].time) {
      upperBound = partition;
    }
  }
  return [arr[lowerBound], arr[upperBound]];
}

export function polyLerp(
  waypoints: Waypoint[],
  when: number
): { location: Coordinate; direction: number } | undefined {
  if (
    waypoints.length &&
    when > waypoints[0].time &&
    when < waypoints[waypoints.length - 1].time
  ) {
    // const [start, end] = binarySearch(waypoints, when);
    // turns out this is faster than the binary search
    const where = waypoints.filter((waypoint) => when >= waypoint.time).length;
    const [start, end] = [waypoints[where - 1], waypoints[where]];

    return {
      location: interpolate(
        start.location,
        end.location,
        (when - start.time) / (end.time - start.time)
      ),
      direction: Math.atan2(
        end.location[1] - start.location[1],
        end.location[0] - start.location[0]
      ),
    };
  }
}
