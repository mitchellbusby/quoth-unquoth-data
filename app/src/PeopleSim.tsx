import allpops from "./data/allpops.json";

export default function getIntent(idx: number) {
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

