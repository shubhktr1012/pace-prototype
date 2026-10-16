"use client";

import React, { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { triggerHaptic } from "@/lib/haptics";
import { usePaceStore } from "@/lib/store";
import { CRISSY_LOOP } from "./crissyLoop";
import { RoutePicker, type RouteTool } from "./RoutePicker";
import {
  buildCourse,
  finishKm,
  lineMetres,
  lineUntil,
  nearestVertex,
  pointAt,
  vertex,
  type LngLat,
} from "./course";

interface Point {
  x: number;
  y: number;
}

const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";
const MAP_TIMEOUT_MS = 4000;
// Past about zoom 14.2 the dark style fills with street names and the
// landmark layer slides off screen, so the focus stays close to the overview.
const FOCUS_ZOOM_STEP = 0.4;
const FOCUS_MAX_ZOOM = 14.1;
// The runner's heading is read over this stretch of the path.
const FOCUS_HEADING_M = 400;

const LABEL_FONT = ["Noto Sans Regular"];

// Taken from the OpenMapTiles poi layer. The framed view sits at zoom 13, and
// that zoom's tiles omit these names. They arrive at zoom 14, which is past
// the closest the map will frame the loop.
const LANDMARKS = {
  type: "FeatureCollection" as const,
  features: [
    // Bridge and Fort Point are nudged onto the framed water. Their true points
    // sit just outside the loop, so the names were clipping off the screen.
    ["Golden Gate Bridge", -122.4672, 37.8108],
    ["Fort Point", -122.4746, 37.8098],
    ["Warming Hut", -122.4696, 37.8074],
    ["Presidio Tunnel Tops", -122.45591, 37.8029],
    ["Palace of Fine Arts", -122.4574, 37.8094],
  ].map(([name, lng, lat]) => ({
    type: "Feature" as const,
    properties: { name },
    geometry: { type: "Point" as const, coordinates: [lng, lat] as [number, number] },
  })),
};

// The dark style paints names in gray. Lift the street and water names it
// already draws, and place the landmarks its zoom 13 tiles leave out.
const revealPlaceNames = (map: MapLibreMap) => {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "symbol") continue;
    if (!map.getLayoutProperty(layer.id, "text-field")) continue;
    const local = layer.id.startsWith("highway_name") || layer.id === "water_name" || layer.id.startsWith("place_");
    if (!local) continue;
    const quiet = layer.id.startsWith("place_country") || layer.id === "place_state" || layer.id.startsWith("place_city");
    map.setPaintProperty(
      layer.id,
      "text-color",
      layer.id === "water_name" ? "rgba(186,220,232,0.8)" : "rgba(255,255,255,0.72)",
    );
    map.setPaintProperty(layer.id, "text-halo-color", "#07080A");
    map.setPaintProperty(layer.id, "text-halo-width", 1.3);
    if (layer.id.startsWith("highway_name")) map.setLayoutProperty(layer.id, "text-size", 12);
    if (!quiet) map.setLayerZoomRange(layer.id, 0, 18);
  }

  map.addSource("pace-landmarks", { type: "geojson", data: LANDMARKS });
  map.addLayer({
    id: "pace-landmarks",
    type: "symbol",
    source: "pace-landmarks",
    layout: {
      "text-field": ["get", "name"],
      "text-font": LABEL_FONT,
      "text-size": 12,
      "text-max-width": 10,
      "text-padding": 2,
      "text-anchor": "top",
      "text-offset": [0, 0.15],
    },
    paint: {
      "text-color": "#FFFFFF",
      "text-halo-color": "#07080A",
      "text-halo-width": 1.5,
    },
  });
};

const lineFeature = (coordinates: LngLat[]) => ({
  type: "Feature" as const,
  properties: {},
  geometry: { type: "LineString" as const, coordinates },
});

const pin = (className: string, letter?: string) => {
  const el = document.createElement("div");
  el.className = className;
  if (letter) el.dataset.letter = letter;
  return el;
};

// Normalized coordinate loop representing the San Francisco Marina to Fort Point coastal route
const ROUTE_WAYPOINTS: Point[] = [
  { x: 0.1, y: 0.82 },
  { x: 0.22, y: 0.66 },
  { x: 0.36, y: 0.5 },
  { x: 0.5, y: 0.36 },
  { x: 0.66, y: 0.24 },
  { x: 0.8, y: 0.16 },
  { x: 0.92, y: 0.12 },
  { x: 0.97, y: 0.24 },
  { x: 0.84, y: 0.36 },
  { x: 0.68, y: 0.48 },
  { x: 0.52, y: 0.6 },
  { x: 0.36, y: 0.72 },
  { x: 0.2, y: 0.84 },
  { x: 0.08, y: 0.94 },
];

export function RunMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { runStatus, telemetry, distanceUnit, routePlan } = usePaceStore();
  const [tool, setTool] = useState<RouteTool | null>(null);
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const statusRef = useRef(runStatus);
  const distanceRef = useRef(telemetry.distanceKm);
  statusRef.current = runStatus;
  distanceRef.current = telemetry.distanceKm;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const runnerRef = useRef<Marker | null>(null);
  const pinRef = useRef<{ start: Marker | null; end: Marker | null; dest: Marker | null }>({
    start: null,
    end: null,
    dest: null,
  });
  const mileMarkersRef = useRef<Marker[]>([]);
  const markerFactoryRef = useRef<((el: HTMLElement) => Marker) | null>(null);
  const mapReadyRef = useRef(false);
  const focusRef = useRef<((target: "runner" | "course", duration?: number) => void) | null>(null);
  const followRef = useRef(true);
  const pinDragRef = useRef(false);
  const lastFollowRef = useRef(0);
  const mapFocusRequest = usePaceStore((s) => s.mapFocusRequest);
  const [mapReady, setMapReady] = useState(false);
  const [showSketch, setShowSketch] = useState(false);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    let disposed = false;
    let loaded = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let resizeObserver: ResizeObserver | undefined;

    const fail = () => {
      if (loaded || disposed) return;
      disposed = true;
      if (timer) clearTimeout(timer);
      mapRef.current?.remove();
      mapRef.current = null;
      setShowSketch(true);
    };

    import("maplibre-gl")
      .then((maplibregl) => {
        if (disposed) return;
        const lngs = CRISSY_LOOP.map((p) => p[0]);
        const lats = CRISSY_LOOP.map((p) => p[1]);
        const bounds: [LngLat, LngLat] = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ];
        // The open band is the map left visible between the route card (or the
        // status bar during a run) and the telemetry sheet. Both are measured,
        // and the desktop shell is CSS-scaled, so rects are mapped back to map pixels.
        const band = () => {
          const h = container.clientHeight;
          const rect = container.getBoundingClientRect();
          const ratio = rect.height > 0 ? h / rect.height : 1;
          const doc = container.ownerDocument;
          const topEl = doc.querySelector<HTMLElement>('[data-map-cover="top"]');
          const bottomEl = doc.querySelector<HTMLElement>('[data-map-cover="bottom"]');
          const top = topEl ? Math.round((topEl.getBoundingClientRect().bottom - rect.top) * ratio) + 20 : 100;
          const bottom = bottomEl
            ? Math.round((rect.bottom - bottomEl.getBoundingClientRect().top) * ratio) + 20
            : Math.round(h * 0.48);
          if (top + bottom >= h - 80) return { top: 72, bottom: 72, left: 28, right: 28 };
          return { top, bottom, left: 36, right: 36 };
        };
        let overviewZoom = 13.3;
        const frameOverview = () => {
          map.setMinZoom(0);
          map.setMaxBounds(null);
          map.fitBounds(bounds, { padding: band(), duration: 0, maxZoom: 16.5 });
          const framed = map.getZoom();
          if (Number.isFinite(framed)) {
            overviewZoom = framed;
            map.setMinZoom(framed - 0.3);
          }
          const view = map.getBounds();
          const latPad = (view.getNorth() - view.getSouth()) * 0.25;
          const lngPad = (view.getEast() - view.getWest()) * 0.25;
          map.setMaxBounds([
            [view.getWest() - lngPad, view.getSouth() - latPad],
            [view.getEast() + lngPad, view.getNorth() + latPad],
          ]);
        };
        focusRef.current = (target, duration = 650) => {
          const plan = usePaceStore.getState().routePlan;
          const course = buildCourse(plan);
          // MapLibre copies keys as given, so an undefined easing replaces its default.
          const easing = duration > 800 ? { easing: (t: number) => t } : {};
          const pad = band();
          if (target === "course") {
            const lngs = course.map((p) => p[0]);
            const lats = course.map((p) => p[1]);
            map.fitBounds(
              [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)],
              ],
              { padding: pad, duration, maxZoom: FOCUS_MAX_ZOOM, ...easing },
            );
            return;
          }
          // The runner sits in the open band, nudged back from its heading so
          // the path ahead has the room. The zoom holds steady for the whole run.
          const total = lineMetres(course);
          const at = Math.min(1, distanceRef.current / finishKm(plan)) * total;
          const here = pointAt(course, at);
          const forward = at + FOCUS_HEADING_M <= total;
          const from = forward ? here : pointAt(course, Math.max(0, at - FOCUS_HEADING_M));
          const to = forward ? pointAt(course, at + FOCUS_HEADING_M) : here;
          let dx = (to[0] - from[0]) * Math.cos((here[1] * Math.PI) / 180);
          let dy = -(to[1] - from[1]);
          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;
          const w = container.clientWidth;
          const h = container.clientHeight;
          const bandH = h - pad.top - pad.bottom;
          const bandMid = pad.top + bandH / 2;
          map.easeTo({
            center: here,
            zoom: Math.min(FOCUS_MAX_ZOOM, overviewZoom + FOCUS_ZOOM_STEP),
            offset: [-dx * w * 0.28, bandMid - h / 2 - dy * bandH * 0.2],
            duration,
            ...easing,
          });
        };
        const frameRoute = () => {
          if (container.clientWidth < 50 || container.clientHeight < 50) return;
          map.resize();
          frameOverview();
          if (!toolRef.current) focusRef.current?.("runner", 0);
          else focusRef.current?.("course", 0);
        };

        // Turbopack does not expose import.meta.url as an http address, so MapLibre
        // cannot find its worker on its own. The copy in public/ is the same file.
        maplibregl.setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);

        const map = new maplibregl.Map({
          container,
          style: MAP_STYLE,
          center: [-122.463, 37.8062],
          zoom: 13.6,
          maxZoom: 16.5,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          keyboard: false,
          attributionControl: { compact: true },
          fadeDuration: 0,
        });
        map.touchZoomRotate.disableRotation();
        mapRef.current = map;
        markerFactoryRef.current = (el) => new maplibregl.Marker({ element: el });

        timer = setTimeout(fail, MAP_TIMEOUT_MS);
        map.on("error", fail);
        resizeObserver = new ResizeObserver(frameRoute);
        resizeObserver.observe(container);

        map.on("load", () => {
          if (disposed) return;
          loaded = true;
          if (timer) clearTimeout(timer);
          frameRoute();

          const underLabels = map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id;
          revealPlaceNames(map);

          const plan = usePaceStore.getState().routePlan;
          const course = buildCourse(plan);
          const metres = Math.min(1, distanceRef.current / finishKm(plan)) * lineMetres(course);
          map.addSource("course", { type: "geojson", data: lineFeature(course) });
          map.addSource("done", { type: "geojson", data: lineFeature(lineUntil(course, metres)) });
          const round = { "line-cap": "round" as const, "line-join": "round" as const };
          map.addLayer({
            id: "course-casing",
            type: "line",
            source: "course",
            layout: round,
            paint: { "line-color": "#000000", "line-width": 7, "line-opacity": 0.5 },
          }, underLabels);
          map.addLayer({
            id: "course",
            type: "line",
            source: "course",
            layout: round,
            paint: { "line-color": "#FFFFFF", "line-width": 2.5, "line-opacity": 0.38 },
          }, underLabels);
          map.addLayer({
            id: "done-glow",
            type: "line",
            source: "done",
            layout: round,
            paint: { "line-color": "#D4FF00", "line-width": 12, "line-opacity": 0.28, "line-blur": 6 },
          }, underLabels);
          map.addLayer({
            id: "done",
            type: "line",
            source: "done",
            layout: round,
            paint: { "line-color": "#D4FF00", "line-width": 4 },
          }, underLabels);

          // Pins can be dragged. A drop snaps to the nearest point on the path.
          const makePin = (kind: RouteTool, className: string, letter: string, at: LngLat) => {
            const marker = new maplibregl.Marker({ element: pin(`pace-pin ${className}`, letter), draggable: true })
              .setLngLat(at)
              .addTo(map);
            marker.on("dragstart", () => {
              pinDragRef.current = true;
              followRef.current = false;
              setTool(kind);
            });
            marker.on("dragend", () => {
              const dropped = marker.getLngLat();
              usePaceStore.getState().placeRoutePoint(kind, nearestVertex([dropped.lng, dropped.lat]));
              const next = usePaceStore.getState().routePlan;
              marker.setLngLat(
                vertex(kind === "start" ? next.start : kind === "end" ? next.end : (next.destination ?? next.start)),
              );
              setTool(null);
              triggerHaptic("light");
            });
            return marker;
          };
          pinRef.current.start = makePin("start", "pace-start", "S", vertex(plan.start));
          pinRef.current.end = makePin("end", "pace-end", "E", vertex(plan.end));
          pinRef.current.end.getElement().style.display = plan.end === plan.start ? "none" : "";
          pinRef.current.dest = makePin("destination", "pace-dest", "D", vertex(plan.destination ?? plan.start));
          pinRef.current.dest.getElement().style.display = plan.destination == null ? "none" : "";

          runnerRef.current = new maplibregl.Marker({ element: pin("pace-beacon") })
            .setLngLat(pointAt(course, metres))
            .addTo(map);

          // A tap places a point only after a slot is chosen, so a stray tap or
          // a double-tap zoom never moves the route.
          map.on("click", (event) => {
            const kind = toolRef.current;
            if (!kind || usePaceStore.getState().runStatus !== "IDLE") return;
            if ((event.originalEvent.target as HTMLElement | null)?.closest(".pace-pin")) return;
            usePaceStore.getState().placeRoutePoint(kind, nearestVertex([event.lngLat.lng, event.lngLat.lat]));
            setTool(null);
            triggerHaptic("light");
          });

          // A finger pan or pinch takes over the camera until the locate button.
          map.on("dragstart", () => {
            followRef.current = false;
          });
          map.on("zoomstart", (event) => {
            if (event.originalEvent) followRef.current = false;
          });

          mapReadyRef.current = true;
          setMapReady(true);
        });
      })
      .catch(fail);

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      focusRef.current = null;
      runnerRef.current = null;
      pinRef.current = { start: null, end: null, dest: null };
      mileMarkersRef.current = [];
      mapReadyRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const course = buildCourse(routePlan);
    const metres = Math.min(1, telemetry.distanceKm / finishKm(routePlan)) * lineMetres(course);
    (map.getSource("course") as GeoJSONSource | undefined)?.setData(lineFeature(course));
    (map.getSource("done") as GeoJSONSource | undefined)?.setData(lineFeature(lineUntil(course, metres)));
    runnerRef.current?.setLngLat(pointAt(course, metres));
    runnerRef.current?.getElement().classList.toggle("is-running", runStatus === "RUNNING");
    pinRef.current.start?.setLngLat(vertex(routePlan.start));
    const endEl = pinRef.current.end?.getElement();
    if (endEl) endEl.style.display = routePlan.end === routePlan.start ? "none" : "";
    pinRef.current.end?.setLngLat(vertex(routePlan.end));
    const destEl = pinRef.current.dest?.getElement();
    if (destEl) destEl.style.display = routePlan.destination == null ? "none" : "";
    if (routePlan.destination != null) pinRef.current.dest?.setLngLat(vertex(routePlan.destination));
    const editable = runStatus === "IDLE";
    pinRef.current.start?.setDraggable(editable);
    pinRef.current.end?.setDraggable(editable);
    pinRef.current.dest?.setDraggable(editable);
    mapContainerRef.current?.classList.toggle("is-placing", editable && toolRef.current != null);
  }, [mapReady, routePlan, telemetry.distanceKm, runStatus, tool]);

  // A chosen slot shows the whole course so the next tap has the path in view.
  // Leaving the slot returns to the runner, except after a pin drag, where the
  // camera stays where the finger left it.
  useEffect(() => {
    if (!mapReady) return;
    if (pinDragRef.current) {
      if (tool == null) pinDragRef.current = false;
      return;
    }
    if (tool) {
      focusRef.current?.("course");
      return;
    }
    followRef.current = true;
    const timer = setTimeout(() => focusRef.current?.("runner"), 450);
    return () => clearTimeout(timer);
  }, [mapReady, tool]);

  // The route card leaves when a run starts, so the band grows and the camera refits.
  useEffect(() => {
    if (!mapReady || runStatus === "RUNNING" || runStatus === "FINISHED") return;
    if (runStatus === "COUNTDOWN" || runStatus === "IDLE") followRef.current = true;
    if (followRef.current && !toolRef.current) focusRef.current?.("runner");
  }, [mapReady, runStatus]);

  // Follow the runner. At 20x the distance ticks every 50ms, so the camera
  // eases at most once a second, linearly, to avoid restarting every frame.
  useEffect(() => {
    if (!mapReady || !followRef.current || toolRef.current) return;
    if (runStatus !== "RUNNING") return;
    const now = performance.now();
    if (now - lastFollowRef.current < 950) return;
    lastFollowRef.current = now;
    focusRef.current?.("runner", 1000);
  }, [mapReady, runStatus, telemetry.distanceKm]);

  useEffect(() => {
    if (!mapReady || mapFocusRequest === 0) return;
    followRef.current = true;
    pinDragRef.current = false;
    if (toolRef.current) setTool(null);
    else focusRef.current?.("runner");
  }, [mapReady, mapFocusRequest]);

  useEffect(() => {
    const map = mapRef.current;
    const makeMarker = markerFactoryRef.current;
    if (!mapReady || !map || !makeMarker) return;
    mileMarkersRef.current.forEach((m) => m.remove());
    const course = buildCourse(routePlan);
    const total = lineMetres(course);
    const limit = finishKm(routePlan);
    const marks = distanceUnit === "mi"
      ? [1, 2, 3].map((mile) => ({ label: String(mile), km: mile * 1.609344 }))
      : [1, 2, 3, 4, 5].map((km) => ({ label: String(km), km }));
    mileMarkersRef.current = marks
      .filter((mark) => mark.km < limit - 0.05)
      .map((mark) => {
        const el = document.createElement("div");
        el.className = "pace-mile";
        el.textContent = mark.label;
        return makeMarker(el).setLngLat(pointAt(course, (mark.km / limit) * total)).addTo(map);
      });
  }, [mapReady, distanceUnit, routePlan]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let alive = true;
    let pulseAngle = 0;

    const render = () => {
      if (!alive) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#10161C";
      ctx.fillRect(0, 0, width, height);

      // Bay sits above the shore. A lighter band reads as shallows.
      const bay = ctx.createLinearGradient(0, 0, 0, height * 0.28);
      bay.addColorStop(0, "#163044");
      bay.addColorStop(1, "#1E4258");
      ctx.beginPath();
      ctx.moveTo(0, height * 0.22);
      ctx.bezierCurveTo(width * 0.28, height * 0.1, width * 0.55, height * 0.2, width * 0.78, height * 0.08);
      ctx.lineTo(width, height * 0.06);
      ctx.lineTo(width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = bay;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, height * 0.22);
      ctx.bezierCurveTo(width * 0.3, height * 0.16, width * 0.62, height * 0.14, width, height * 0.09);
      ctx.lineTo(width, height * 0.06);
      ctx.bezierCurveTo(width * 0.7, height * 0.1, width * 0.4, height * 0.12, 0, height * 0.18);
      ctx.closePath();
      ctx.fillStyle = "rgba(120, 186, 210, 0.16)";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, height * 0.34);
      ctx.bezierCurveTo(width * 0.22, height * 0.22, width * 0.48, height * 0.3, width * 0.7, height * 0.18);
      ctx.bezierCurveTo(width * 0.84, height * 0.12, width * 0.94, height * 0.16, width, height * 0.14);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = "#151A16";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, height * 0.34);
      ctx.bezierCurveTo(width * 0.22, height * 0.22, width * 0.48, height * 0.3, width * 0.7, height * 0.18);
      ctx.bezierCurveTo(width * 0.84, height * 0.12, width * 0.94, height * 0.16, width, height * 0.14);
      ctx.strokeStyle = "rgba(186, 220, 232, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Presidio contours, faint enough to sit under the route.
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const y = height * (0.4 + i * 0.07);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(width * 0.28, y - 16 - i * 3, width * 0.62, y + 10, width, y - 6);
        ctx.stroke();
      }
      ctx.restore();

      // Crissy grass between the two legs of the loop
      ctx.beginPath();
      ctx.moveTo(width * 0.28, height * 0.3);
      ctx.quadraticCurveTo(width * 0.5, height * 0.2, width * 0.72, height * 0.22);
      ctx.quadraticCurveTo(width * 0.58, height * 0.34, width * 0.34, height * 0.38);
      ctx.closePath();
      ctx.fillStyle = "#1C2A1E";
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.42)";
      ctx.font = "600 10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("MARINA", width * 0.06, height * 0.36);
      ctx.fillText("CRISSY", width * 0.32, height * 0.3);
      ctx.fillText("FORT PT", width * 0.48, height * 0.18);

      const paddingX = 22;
      const mapTop = height * 0.15;
      const mapH = height * 0.44;
      const innerW = width - paddingX * 2;
      const innerH = mapH;

      const screenPts: Point[] = ROUTE_WAYPOINTS.map((pt) => ({
        x: paddingX + pt.x * innerW,
        y: mapTop + pt.y * innerH,
      }));

      // 4. Draw base route shadow / roadbed
      ctx.beginPath();
      ctx.moveTo(screenPts[0].x, screenPts[0].y);
      for (let i = 1; i < screenPts.length; i++) {
        ctx.lineTo(screenPts[i].x, screenPts[i].y);
      }
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.lineWidth = 3.25;
      ctx.stroke();
      ctx.setLineDash([1.5, 6]);
      ctx.strokeStyle = "rgba(7, 8, 10, 0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      const lengths: number[] = [];
      let total = 0;
      for (let i = 1; i < screenPts.length; i++) {
        const len = Math.hypot(screenPts[i].x - screenPts[i - 1].x, screenPts[i].y - screenPts[i - 1].y);
        lengths.push(len);
        total += len;
      }
      const pointAlong = (t: number) => {
        let remain = Math.max(0, Math.min(1, t)) * total;
        for (let i = 0; i < lengths.length; i++) {
          if (remain <= lengths[i] || i === lengths.length - 1) {
            const f = lengths[i] === 0 ? 0 : remain / lengths[i];
            return {
              x: screenPts[i].x + (screenPts[i + 1].x - screenPts[i].x) * f,
              y: screenPts[i].y + (screenPts[i + 1].y - screenPts[i].y) * f,
            };
          }
          remain -= lengths[i];
        }
        return screenPts[screenPts.length - 1];
      };
      ctx.font = "700 10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      const routeKm = 5.24;
      const markers = distanceUnit === "mi"
        ? [1, 2].map((mile) => ({ label: String(mile), t: (mile * 1.609344) / routeKm }))
        : [1, 2, 3].map((km) => ({ label: String(km), t: km / routeKm }));
      for (const marker of markers) {
        const point = pointAlong(marker.t);
        ctx.fillStyle = "#07080A";
        ctx.beginPath();
        ctx.arc(point.x, point.y - 14, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(marker.label, point.x, point.y - 11);
      }
      ctx.textAlign = "left";

      // 5. Draw active glowing polyline (Electric Volt with neon blur)
      // Progress calculation based on distance up to 5.24 km
      const maxDistance = 5.24;
      const progressRatio = Math.min(1, Math.max(0, distanceRef.current / maxDistance));
      const targetIndex = (screenPts.length - 1) * progressRatio;
      const baseIndex = Math.floor(targetIndex);
      const frac = targetIndex - baseIndex;

      if (progressRatio > 0.01) {
        ctx.strokeStyle = "rgba(212, 255, 0, 0.35)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(screenPts[0].x, screenPts[0].y);
        for (let i = 1; i <= baseIndex; i++) {
          ctx.lineTo(screenPts[i].x, screenPts[i].y);
        }
        if (baseIndex < screenPts.length - 1) {
          const cur = screenPts[baseIndex];
          const nxt = screenPts[baseIndex + 1];
          ctx.lineTo(cur.x + (nxt.x - cur.x) * frac, cur.y + (nxt.y - cur.y) * frac);
        }
        ctx.stroke();
        ctx.strokeStyle = "#D4FF00";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Current runner position along path
      let runnerX = screenPts[0].x;
      let runnerY = screenPts[0].y;
      let heading = 0;

      if (baseIndex < screenPts.length - 1) {
        const p1 = screenPts[baseIndex];
        const p2 = screenPts[baseIndex + 1];
        runnerX = p1.x + (p2.x - p1.x) * frac;
        runnerY = p1.y + (p2.y - p1.y) * frac;
        heading = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      } else {
        const last = screenPts[screenPts.length - 1];
        runnerX = last.x;
        runnerY = last.y;
      }

      // 6. Start Flag / Milestone pin
      ctx.fillStyle = "#00E5FF";
      ctx.beginPath();
      ctx.arc(screenPts[0].x, screenPts[0].y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#07080A";
      ctx.beginPath();
      ctx.arc(screenPts[0].x, screenPts[0].y, 2, 0, Math.PI * 2);
      ctx.fill();

      const end = screenPts[screenPts.length - 1];
      ctx.fillStyle = "#D4FF00";
      ctx.fillRect(end.x - 4, end.y - 4, 8, 8);

      // Start label
      // 7. Dynamic Runner Beacon (Pulsing Radar + Heading Cone)
      pulseAngle += 0.045;
      const pulseSize = 10 + Math.sin(pulseAngle) * 5;
      const pulseAlpha = 0.5 - Math.sin(pulseAngle) * 0.25;

      // Radar ripple
      ctx.strokeStyle = `rgba(212, 255, 0, ${pulseAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(runnerX, runnerY, pulseSize, 0, Math.PI * 2);
      ctx.stroke();

      // Heading directional beam cone
      ctx.save();
      ctx.translate(runnerX, runnerY);
      ctx.rotate(heading);

      const coneGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
      coneGrad.addColorStop(0, "rgba(212, 255, 0, 0.35)");
      coneGrad.addColorStop(1, "rgba(212, 255, 0, 0)");
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 22, -Math.PI / 4, Math.PI / 4);
      ctx.closePath();
      ctx.fill();

      // Solid inner core dot
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#D4FF00";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.restore();

      if (alive && statusRef.current === "RUNNING" && !mapReadyRef.current) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      if (statusRef.current !== "RUNNING") render();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      alive = false;
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [runStatus, distanceUnit]);

  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-[#10161C]">
      <canvas ref={canvasRef} className={`w-full h-full block ${showSketch ? "" : "invisible"}`} />
      <div
        ref={mapContainerRef}
        role="application"
        aria-label="Crissy Field route"
        className={`pace-map absolute inset-0 transition-opacity duration-500 ${mapReady ? "opacity-100" : "opacity-0"}`}
      />

      {runStatus === "IDLE" && <RoutePicker tool={tool} onTool={setTool} />}

      {/* Subtle vignette shadow overlays around borders */}
      <div
        className={`absolute inset-x-0 top-0 bg-gradient-to-b pointer-events-none transition-[height] duration-300 ${
          runStatus === "IDLE"
            ? "h-[208px] from-[#07080A] via-[#07080A]/85 to-transparent"
            : "h-16 from-black/80 via-black/30 to-transparent"
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07080A] via-[#07080A]/60 to-transparent pointer-events-none" />
    </div>
  );
}
