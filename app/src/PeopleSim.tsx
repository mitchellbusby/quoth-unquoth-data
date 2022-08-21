import allpops from "./data/allpops.json";
import {
  PriorityQueue,
  MinPriorityQueue,
  MaxPriorityQueue,
  ICompare,
  IGetCompareValue,
} from '@datastructures-js/priority-queue';

export function getIntent(idx: number) {
    let person = allpops.people[idx];
    const {home, destination, arrivalTime, duration} = person;
    let source = allpops.sources[home];
    let dest = allpops.destinations[destination];
    return {
        'source': [source.lon, source.lat],
        'destination': [dest.lon, dest.lat],
        'arrivalTime': arrivalTime,
        'departureTime': arrivalTime + duration,
        'tripName': source.name + '-'+ dest.name,
    }
}

function dist(a, b) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

class PFNodeStop {
    constructor(h, g, parent, lon, lat, stopIdx) {
        this.h = h;
        this.g = g;
        this.f = h + g;
        this.parent = parent;
        this.lon = lon
        this.lat = lat
        this.stopIdx = stopIdx;
    }
}

class PFNodeTrip {
    constructor(h, g, parent, lon, lat, tripId) {
        this.h = h;
        this.g = g;
        this.f = h + g;
        this.parent = parent;
        this.tripId = tripId;
    }
}

function indexOfMin(arr) {
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

function reconstruct(node) {
    let nodes = [];
    while (node !== undefined) {
        nodes.push(node.stopIdx);
        node = node.parent;
    }
    return nodes;
}

function hasNode(nodes, node) {
    for (node_ of nodes) {
        if (node_.stopIdx == node.stopIdx) {
            return true;
        }
    }
    return false;
}

export function generateCachedTripMap(busRoutes, stops) {
    const routeEntries = Object.entries(busRoutes);
    // map stop -> [(trip, time)]
    let stopTripTimeMap = {};
    for (let stop of Object.keys(stops)) {
        stopTripTimeMap[stop] = [];
    }
    for (const [tripId, {stops, times}] of routeEntries) {
        for (let i = 0; i < stops.length; i++) {
            stopTripTimeMap[stops[i]].push([tripId, times[i]]);
        }
    }
    return stopTripTimeMap;
}

export function pathFind(intent, busRoutes, stops, cachedTripMap) {
    // TODO: Check if there's a direct route first.
    // Pathfind backwards...
    const allowRadius = 0.01; // 1 km
    const walkSpeed = 88650; // s/deg
    // Find the bus stops within allowRadius and calculate their edge weights.
    const frontier = new PriorityQueue((a, b) => {
        if (a.f <= b.f) {
          return -1;
        }
        if (a.f > b.f) {
          return 1;
        }
    });
    const stopTripTimeMap = cachedTripMap;
    let seen = new Set();
    for (let id in stops) {
        let s = stops[id];
        let distance = dist([s.lon, s.lat], intent.destination);
        if (distance > allowRadius) {
            // Too far!
            continue;
        }
        let walkTime = distance * walkSpeed;
        let h = 0;
        frontier.enqueue(
            new PFNodeStop(h, walkTime, undefined, s.lon, s.lat, parseInt(id)));
    }
    // yaaay we have a frontier
    while (!frontier.isEmpty()) {
        let openNode = frontier.dequeue();
        if (seen.has(openNode.stopIdx)) {
            continue;
        }
        seen.add(openNode.stopIdx);
        // console.log('exploring', openNode.stopIdx, 'with seen count', seen.size)

        let distToGoal = dist([openNode.lon, openNode.lat], intent.source);
        if (distToGoal < allowRadius) {
            // We are done.
            return reconstruct(openNode);
        }

        // For each connecting bus route that arrives before the current time...
        let now = intent.arrivalTime - openNode.g;
        // Find all trips that visited this bus stop already.
        let goodTrips = [];
        for (const [trip, time] of stopTripTimeMap[openNode.stopIdx]) {
            if (time <= now && ((now - time) < 20 * 60)) {
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
            let distances = stops_.map(s => dist([stops[s].lon, stops[s].lat], intent.destination));
            let argmin = indexOfMin(distances);
            let timeAtGoalStop = times_[argmin];
            // baseH is how long it takes to walk from the best stop to home
            let baseH = Math.min(...distances) * walkSpeed;
            for (let i = 1; i < stops_.length; i++) { // can't catch a bus that doesn't go anywhere
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
                        let stop = stops[stops_[j]]
                        frontier.enqueue(
                            new PFNodeStop(h, g, openNode, stop.lon, stop.lat, stops_[j]));
                    }
                }
            }
        }
    }
    return null;
}
