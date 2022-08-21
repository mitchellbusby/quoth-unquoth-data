import allpops from "./data/allpops.json";
import { PriorityQueue } from "@datastructures-js/priority-queue";
import { Coordinate, distance } from "ol/coordinate";
import { TripCollection } from "./AppState";

interface Intent {
  source: Coordinate;
  destination: Coordinate;
  arrivalTime: number;
  departureTime: number;
  tripName: string;
}

export function getIntent(idx: number): Intent {
  let person = allpops.people[idx];
  const { home, destination, arrivalTime, duration } = person;
  let source = allpops.sources[home];
  let dest = allpops.destinations[destination];
  return {
    source: [source.lon, source.lat],
    destination: [dest.lon, dest.lat],
    arrivalTime: arrivalTime,
    departureTime: arrivalTime + duration,
    tripName: source.name + "-" + dest.name,
  };
}

interface PFNode {
  h: number;
  g: number;
  parent?: PFNode;
}

interface PFNodeTrip extends PFNode {
  tripId: number;
}

interface PFNodeStop extends PFNode {
  lon: number;
  lat: number;
  stopIdx: number;
}

function f(node: PFNode) {
  return node.h + node.g;
}

function indexOfMin(arr: number[]) {
  // https://stackoverflow.com/a/11301464
  if (arr.length === 0) {
    return -1;
  }

  var min = arr[0];
  var minIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      minIndex = i;
      min = arr[i];
    }
  }

  return minIndex;
}

function reconstruct(node: PFNodeStop | undefined) {
  let nodes: number[] = [];
  while (node !== undefined) {
    nodes.push(node.stopIdx);
    node = node.parent as PFNodeStop | undefined;
  }
  return nodes;
}
/*
function hasNode(nodes, node) {
  for (node_ of nodes) {
    if (node_.stopIdx == node.stopIdx) {
      return true;
    }
  }
  return false;
} */

type StopCollection = {
  [stopId: number]: {
    name: string;
    lat: number;
    lon: number;
  };
};

type TripTime = [string, number];

type TripTimeMap = { [stopId: number]: TripTime[] };

export function generateCachedTripMap(
  busRoutes: TripCollection,
  stops: StopCollection
): TripTimeMap {
  const routeEntries = Object.entries(busRoutes);
  // map stop -> [(trip, time)]
  let stopTripTimeMap = {};
  for (let stop of Object.keys(stops)) {
    stopTripTimeMap[stop] = [];
  }
  for (const [tripId, { stops, times }] of routeEntries) {
    for (let i = 0; i < stops.length; i++) {
      stopTripTimeMap[stops[i]].push([tripId, times[i]]);
    }
  }
  return stopTripTimeMap;
}

export function pathFind(
  intent: Intent,
  busRoutes: TripCollection,
  stops: StopCollection,
  cachedTripMap: TripTimeMap
) {
  // TODO: Check if there's a direct route first.
  // Pathfind backwards...
  const allowRadius = 0.01; // 1 km
  const walkSpeed = 88650; // s/deg
  // Find the bus stops within allowRadius and calculate their edge weights.
  const frontier = new PriorityQueue<PFNodeStop>((a, b) => {
    if (f(a) <= f(b)) {
      return -1;
    } else {
      return 1;
    }
  });
  const stopTripTimeMap = cachedTripMap;
  let seen = new Set();
  for (let id in stops) {
    let s = stops[id];
    let d = distance([s.lon, s.lat], intent.destination);
    if (d > allowRadius) {
      // Too far!
      continue;
    }
    let walkTime = d * walkSpeed;
    let h = 0;
    frontier.enqueue({
      h,
      g: walkTime,
      lon: s.lon,
      lat: s.lat,
      stopIdx: parseInt(id),
    });
  }
  // yaaay we have a frontier
  while (!frontier.isEmpty()) {
    let openNode = frontier.dequeue();
    if (seen.has(openNode.stopIdx)) {
      continue;
    }
    seen.add(openNode.stopIdx);
    // console.log('exploring', openNode.stopIdx, 'with seen count', seen.size)

    let distToGoal = distance([openNode.lon, openNode.lat], intent.source);
    if (distToGoal < allowRadius) {
      // We are done.
      return reconstruct(openNode);
    }

    // For each connecting bus route that arrives before the current time...
    let now = intent.arrivalTime - openNode.g;
    // Find all trips that visited this bus stop already.
    let goodTrips: TripTime[] = [];
    for (const [trip, time] of stopTripTimeMap[openNode.stopIdx]) {
      if (time <= now && now - time < 20 * 60) {
        // trip is at a good time to board
        goodTrips.push([trip, time]);
      }
    }
    // Each of these will have a g and an h.
    // The g is how long we have to wait plus existing g.
    for (const [tripId, stopTime] of goodTrips) {
      const tripDetails = busRoutes[tripId];
      const stops_ = tripDetails.stops;
      const times_ = tripDetails.times;
      // h is the minimum distance from a bus stop on this trip to the goal...
      // times the walk speed, plus the time between stops.
      let distances = stops_.map((s) =>
        distance([stops[s].lon, stops[s].lat], intent.destination)
      );
      let argmin = indexOfMin(distances);
      let timeAtGoalStop = times_[argmin];
      // baseH is how long it takes to walk from the best stop to home
      let baseH = Math.min(...distances) * walkSpeed;
      for (let i = 1; i < stops_.length; i++) {
        // can't catch a bus that doesn't go anywhere
        if (stops_[i] == openNode.stopIdx) {
          // add all previous stops
          // timeDelta is how long we have between now and the time
          // that the bus arrived
          let timeDelta = now - times_[i];
          for (let j = i - 1; j >= 0; j--) {
            // time to get to stop j including waiting for bus
            let g = openNode.g + timeDelta + (times_[i] - times_[j]);
            // time to get from next stop to home
            let h = baseH + (times_[j] - timeAtGoalStop);
            // Then, just advance us to the next bus stop.
            let stop = stops[stops_[j]];
            frontier.enqueue({
              h,
              g,
              parent: openNode,
              lon: stop.lon,
              lat: stop.lat,
              stopIdx: stops_[j],
            });
          }
        }
      }
    }
  }
  return null;
}
