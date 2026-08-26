"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Rotation } from "@/types/game";

interface StarryBackgroundProps {
  rotation: Rotation;
}

export default function StarryBackground({ rotation }: StarryBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true,
    });

    const starVertices: number[] = [];
    for (let i = 0; i < 1000; i++) {
      starVertices.push(
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000
      );
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    starFieldRef.current = starField;
    scene.add(starField);
    camera.position.z = 5;

    let running = true;
    const animate = () => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("resize", onResize);
      starsGeometry.dispose();
      starsMaterial.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      starFieldRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!starFieldRef.current) return;
    const [lon, lat] = rotation;
    starFieldRef.current.rotation.x = lat * (Math.PI / 180);
    starFieldRef.current.rotation.y = lon * (Math.PI / 180);
  }, [rotation]);

  return (
    <div
      ref={mountRef}
      className="starry-background"
      aria-hidden
    />
  );
}
