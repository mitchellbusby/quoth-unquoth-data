import { Coordinate } from "ol/coordinate";
import { Extent, intersectsSegment } from "ol/extent";
import { fromLonLat } from "ol/proj";
import lines from "./data/bus_route_shapes.json";

function project(p: Coordinate, a: Coordinate, b: Coordinate) {
  var atob = [b[0] - a[0], b[1] - a[1]];
  var atop = [p[0] - a[0], p[1] - a[1]];
  var len = atob[0] * atob[0] + atob[1] * atob[1];
  var dot = atop[0] * atob[0] + atop[1] * atob[1];
  var t = Math.min(1, Math.max(0, dot / len));

  dot = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);

  return {
    point: [a[0] + atob[0] * t, a[1] + atob[1] * t],
    left: dot < 1,
    dot: dot,
    t: t,
    len,
  };
}

const lineSegments = [];
for (const line of lines) {
  const segments = lines.slice(1).map((elem, idx) => [lines[idx], elem]);
  for (const [start, end] of segments) {
    lineSegments.push([start, end]);
  }
}

console.log(lineSegments.length);

export function getRelevantSegments(bounds: Extent) {
  return lineSegments.filter((lineSegment) =>
    intersectsSegment(
      bounds,
      fromLonLat(lineSegment[0]),
      fromLonLat(lineSegment[1])
    )
  );
}

export function snapToRoad(
  point: Coordinate,
  segments: [Coordinate, Coordinate]
) {
  const candidates = [];
  for (const [start, end] of segments) {
    candidates.push(project(point, start, end));
  }
  return candidates.sort((a, b) => a.len - b.len)[0]?.point || point;
}
