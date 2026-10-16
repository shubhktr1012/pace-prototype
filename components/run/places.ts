import { segmentMetres, vertex, type LngLat } from "./course";

// Named places from the OpenMapTiles poi layer that sit beside the path.
// A route point takes the name of whichever one is closest.
const PLACES: { name: string; at: LngLat }[] = [
  { name: "Crissy Field", at: [-122.4491, 37.80576] },
  { name: "Tunnel Tops", at: [-122.45591, 37.8029] },
  { name: "Outpost Meadow", at: [-122.45811, 37.80339] },
  { name: "Sports Basement", at: [-122.45927, 37.80286] },
  { name: "House of Air", at: [-122.46862, 37.80493] },
  { name: "Visitor Center", at: [-122.46706, 37.80543] },
  { name: "Warming Hut", at: [-122.47071, 37.80832] },
  { name: "Fort Point", at: [-122.47297, 37.80847] },
  { name: "Fort Point", at: [-122.47688, 37.81049] },
];

const NEAR_METRES = 300;

export const placeName = (index: number): string => {
  const point = vertex(index);
  let best = "Crissy Field";
  let bestMetres = Infinity;
  for (const place of PLACES) {
    const metres = segmentMetres(point, place.at);
    if (metres < bestMetres) {
      bestMetres = metres;
      best = place.name;
    }
  }
  return bestMetres <= NEAR_METRES ? best : "Crissy Field";
};
