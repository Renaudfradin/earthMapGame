"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { getClimateColor } from "@/lib/climateColors";
import { getWorldGeoJson } from "@/lib/worldGeoJson";
import type { CountryFeature, Rotation, WorldGeoJson } from "@/types/game";

const BASE_SCALE = 280;
const MIN_SIZE = 320;

export interface GlobeMapProps {
  selectedCountry: string | null;
  wrongGuess: string | null;
  correctGuess: string | null;
  isBlinking: boolean;
  isValidated: boolean;
  isPlaying: boolean;
  targetCountry: string | null;
  onCountrySelected: (countryName: string) => void;
  onRotationChange: (rotation: Rotation) => void;
}

function fillForCountry(
  country: CountryFeature,
  selectedCountry: string | null,
  wrongGuess: string | null,
  correctGuess: string | null,
  isBlinking: boolean
): string {
  const latitude = d3.geoCentroid(country)[1];
  const climateColor = getClimateColor(latitude);
  const name = country.properties.name;

  if (correctGuess === name) {
    return isBlinking ? "green" : climateColor;
  }
  if (wrongGuess === name) {
    return isBlinking ? "red" : climateColor;
  }
  if (selectedCountry === name) {
    return "yellow";
  }
  return climateColor;
}

export default function GlobeMap({
  selectedCountry,
  wrongGuess,
  correctGuess,
  isBlinking,
  isValidated,
  isPlaying,
  targetCountry,
  onCountrySelected,
  onRotationChange,
}: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const pathRef = useRef<d3.GeoPath<unknown, d3.GeoPermissibleObjects> | null>(
    null
  );
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const scaleKRef = useRef(1);
  const rotationRef = useRef<Rotation>([0, 0, 0]);
  const countriesRef = useRef<WorldGeoJson | null>(null);
  const sizeRef = useRef({ width: 600, height: 600 });
  const rafRef = useRef<number | null>(null);
  const rotationThrottleRef = useRef(0);
  const highlightCircleRef = useRef<d3.Selection<
    SVGCircleElement,
    unknown,
    null,
    undefined
  > | null>(null);

  const propsRef = useRef({
    selectedCountry,
    wrongGuess,
    correctGuess,
    isBlinking,
    isValidated,
    isPlaying,
    targetCountry,
    onCountrySelected,
    onRotationChange,
  });

  propsRef.current = {
    selectedCountry,
    wrongGuess,
    correctGuess,
    isBlinking,
    isValidated,
    isPlaying,
    targetCountry,
    onCountrySelected,
    onRotationChange,
  };

  const redrawPaths = () => {
    const svg = d3.select(svgRef.current);
    const path = pathRef.current;
    if (!path) return;
    svg.selectAll<SVGPathElement, unknown>("path").attr("d", path as never);
  };

  const emitRotation = (force = false) => {
    const now = performance.now();
    if (!force && now - rotationThrottleRef.current < 100) return;
    rotationThrottleRef.current = now;
    propsRef.current.onRotationChange([...rotationRef.current] as Rotation);
  };

  const updateFills = () => {
    const {
      selectedCountry: selected,
      wrongGuess: wrong,
      correctGuess: correct,
      isBlinking: blinking,
    } = propsRef.current;
    const svg = d3.select(svgRef.current);
    svg
      .selectAll<SVGPathElement, CountryFeature>("path.country")
      .attr("fill", (d) =>
        fillForCountry(d, selected, wrong, correct, blinking)
      );
  };

  const updatePointerEvents = () => {
    const { isPlaying: playing } = propsRef.current;
    d3.select(svgRef.current)
      .selectAll("path.country")
      .attr("pointer-events", playing ? "all" : "none");
  };

  const updateHighlight = () => {
    const svg = d3.select(svgRef.current);
    const path = pathRef.current;
    const data = countriesRef.current;
    const { wrongGuess: wrong, targetCountry: target } = propsRef.current;

    if (highlightCircleRef.current) {
      highlightCircleRef.current.remove();
      highlightCircleRef.current = null;
    }

    if (!wrong || !target || !path || !data) return;

    const targetFeature = data.features.find(
      (feature) => feature.properties.name === target
    );
    if (!targetFeature) return;

    const bounds = path.bounds(targetFeature);
    if (!bounds) return;
    const [[x0, y0], [x1, y1]] = bounds;
    const x = (x0 + x1) / 2;
    const y = (y0 + y1) / 2;
    const radius = Math.max((x1 - x0) / 2, (y1 - y0) / 2);

    highlightCircleRef.current = svg
      .append("circle")
      .attr("class", "highlight-circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", radius + 10)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("fill", "none");
  };

  const stopIdle = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const startIdle = () => {
    stopIdle();
    const tick = () => {
      if (propsRef.current.isPlaying) {
        rafRef.current = null;
        return;
      }
      const projection = projectionRef.current;
      if (projection) {
        const rotate = projection.rotate() as Rotation;
        rotate[0] += 0.15;
        projection.rotate(rotate);
        rotationRef.current = rotate;
        redrawPaths();
        emitRotation();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Init once
  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    let cancelled = false;
    const svg = d3.select(svgEl);

    const applySize = (width: number, height: number) => {
      sizeRef.current = { width, height };
      svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
      const projection = projectionRef.current;
      if (projection) {
        projection.translate([width / 2, height / 2]);
        projection.scale(BASE_SCALE * scaleKRef.current * (width / 600));
        redrawPaths();
      }
    };

    const build = (data: WorldGeoJson) => {
      if (cancelled) return;
      countriesRef.current = data;

      const width = Math.max(container.clientWidth || 600, MIN_SIZE);
      const height = Math.max(container.clientHeight || 600, MIN_SIZE);
      sizeRef.current = { width, height };

      svg.selectAll("*").remove();
      svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

      const projection = d3
        .geoOrthographic()
        .scale(BASE_SCALE * scaleKRef.current * (width / 600))
        .translate([width / 2, height / 2])
        .rotate(rotationRef.current)
        .clipAngle(90);

      projectionRef.current = projection;
      const path = d3.geoPath(projection);
      pathRef.current = path;

      svg
        .append("path")
        .datum({ type: "Sphere" } as d3.GeoPermissibleObjects)
        .attr("class", "sphere")
        .attr("d", path)
        .attr("fill", "#002fa7");

      const g = svg.append("g").attr("class", "countries");

      g.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", (d) =>
          fillForCountry(
            d,
            propsRef.current.selectedCountry,
            propsRef.current.wrongGuess,
            propsRef.current.correctGuess,
            propsRef.current.isBlinking
          )
        )
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr(
          "pointer-events",
          propsRef.current.isPlaying ? "all" : "none"
        )
        .on("click", (event, d) => {
          const {
            isPlaying: playing,
            isValidated: validated,
            onCountrySelected: select,
          } = propsRef.current;
          if (playing && !validated && d) {
            select(d.properties.name);
          }
          event.stopPropagation();
        })
        .on("mouseover", function (event, d) {
          const {
            isPlaying: playing,
            isValidated: validated,
            selectedCountry: selected,
          } = propsRef.current;
          if (
            playing &&
            !validated &&
            d &&
            d.properties.name !== selected
          ) {
            d3.select(this).attr("fill", "lightblue");
          }
        })
        .on("mouseout", function (event, d) {
          const {
            isPlaying: playing,
            isValidated: validated,
            selectedCountry: selected,
            wrongGuess: wrong,
            correctGuess: correct,
            isBlinking: blinking,
          } = propsRef.current;
          if (
            playing &&
            !validated &&
            d &&
            d.properties.name !== selected
          ) {
            d3.select(this).attr(
              "fill",
              fillForCountry(d, selected, wrong, correct, blinking)
            );
          }
        });

      const drag = d3
        .drag<SVGSVGElement, unknown>()
        .on("drag", (event) => {
          if (!propsRef.current.isPlaying) return;
          const proj = projectionRef.current;
          if (!proj) return;
          const { width: w, height: h } = sizeRef.current;
          const rotate = proj.rotate() as Rotation;
          const dx = (event.dx / w) * 360;
          const dy = (event.dy / h) * 180;
          const next: Rotation = [rotate[0] + dx, rotate[1] - dy, rotate[2]];
          proj.rotate(next);
          rotationRef.current = next;
          redrawPaths();
          emitRotation();
        })
        .on("end", () => emitRotation(true));

      svg.call(drag);

      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .filter((event) => {
          if (!propsRef.current.isPlaying) return false;
          if (event.type === "wheel") return true;
          // Pinch zoom only — single-finger stays for drag rotation
          if (event.type === "touchstart") {
            return Boolean(event.touches && event.touches.length >= 2);
          }
          return false;
        })
        .on("zoom", (event) => {
          if (!propsRef.current.isPlaying) return;
          const proj = projectionRef.current;
          if (!proj) return;
          scaleKRef.current = event.transform.k;
          const { width: w } = sizeRef.current;
          proj.scale(BASE_SCALE * scaleKRef.current * (w / 600));
          redrawPaths();
          updateHighlight();
        });

      zoomRef.current = zoom;
      svg.call(zoom);
      svg.call(
        zoom.transform,
        d3.zoomIdentity.scale(scaleKRef.current)
      );

      updateHighlight();

      if (!propsRef.current.isPlaying) {
        startIdle();
      }
    };

    getWorldGeoJson().then(build).catch(console.error);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        applySize(Math.max(width, MIN_SIZE), Math.max(height, MIN_SIZE));
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      stopIdle();
      resizeObserver.disconnect();
      svg.on(".drag", null);
      svg.on(".zoom", null);
      svg.selectAll("*").remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  // Playing / idle toggle
  useEffect(() => {
    if (isPlaying) {
      stopIdle();
      emitRotation(true);
    } else {
      startIdle();
    }
    updatePointerEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Color / highlight updates without rebuild
  useEffect(() => {
    updateFills();
    updateHighlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, wrongGuess, correctGuess, isBlinking, targetCountry]);

  return (
    <div ref={containerRef} className="globe-map-container">
      <svg ref={svgRef} className="globe-map-svg" />
    </div>
  );
}
