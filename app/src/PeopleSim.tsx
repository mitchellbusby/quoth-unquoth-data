import allpops from "./data/allpops.json";

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
        nodes.push(node);
        node = node.parent;
    }
    return nodes;
}

export function pathFind(intent, busRoutes, stops) {
    // Pathfind backwards...
    const allowRadius = 0.005; // 500m
    const walkSpeed = 88650; // s/deg
    // Find the bus stops within allowRadius and calculate their edge weights.
    let frontier = [];
    for (let [id, s] of Object.entries(stops)) {
        let distance = dist([s.lon, s.lat], intent.destination);
        if (distance > allowRadius) {
            // Too far!
            continue;
        }
        let walkTime = distance * walkSpeed;
        let h = 0;
        frontier.push(new PFNodeStop(h, walkTime, undefined, s.lon, s.lat, id));
    }
    // yaaay we have a frontier
    while (frontier.length) {
        // TODO: Make this log(n) instead of linear.
        let minIndex = indexOfMin(frontier); // todo fix this lol
        let openNode = frontier[minIndex];
        // console.log('exploring node', openNode);
        frontier.slice(minIndex, 1);

        let distToGoal = dist([openNode.lon, openNode.lat], intent.source);
        // console.log('dist to goal is', distToGoal);
        if (distToGoal < allowRadius) {
            // We are done.
            return reconstruct(openNode);
        }

        // For each connecting bus route that arrives before the current time...
        let now = intent.arrivalTime - openNode.g;
        // Find all trips that visited this bus stop already.
        let trips = Object.entries(busRoutes).filter(
            ([tripId, { stops, times }]) => {
                let found = false;
                for (let i = 1; i < stops.length; i++) {  // can't catch a bus that doesn't go anywhere
                    let stop = stops[i];
                    let time = times[i];
                    if (stop != openNode.id || time > now || (now - time) > 10 * 60) {
                        // either not the right stop or arrives too late or takes too long
                        continue;
                    }
                    return true;
                }
                return false; // bus doesn't visit this stop (or visits it too late)
            }
        );
        // Each of these will have a g and an h.
        // The g is how long we have to wait plus existing g.
        for ([tripId, {stops_, times_}] of Object.entries(trips)) {
            // h is the minimum distance from a bus stop on this trip to the goal...
            // times the walk speed, plus the time between stops.
            let distances = stops_.map(s => dist([s.lon, s.lat], intent.destination));
            let argmin = indexOfMin(distances);
            let timeAtGoalStop = times_[argmin];
            let baseH = Math.min(distances) * walkSpeed;
            for (let i = 1; i < stops_.length; i++) { // can't catch a bus that doesn't go anywhere
                if (stops_[i] == openNode.id) {
                    let timeDelta = now - times_[i];
                    // time to get to next stop including waiting for bus
                    let g = openNode.g + timeDelta + (times_[i] - times[i - 1]);
                    // time to get from next stop to home
                    let h = baseH + (times_[i - 1] - timeAtGoalStop);
                    // Then, just advance us to the next bus stop.
                    let stop = stops[stops_[i - 1]]
                    frontier.push(PFNodeStop(h, g, openNode, stop.lon, stop.lat, stops_[i - 1]));
                }
            }
        }
    }
    return null;
}

        // for each neighbor of current
        //     // d(current,neighbor) is the weight of the edge from current to neighbor
        //     // tentative_gScore is the distance from start to the neighbor through current
        //     tentative_gScore := gScore[current] + d(current, neighbor)
        //     if tentative_gScore < gScore[neighbor]
        //         // This path to neighbor is better than any previous one. Record it!
        //         cameFrom[neighbor] := current
        //         gScore[neighbor] := tentative_gScore
        //         fScore[neighbor] := tentative_gScore + h(neighbor)
        //         if neighbor not in openSet
        //             openSet.add(neighbor)
