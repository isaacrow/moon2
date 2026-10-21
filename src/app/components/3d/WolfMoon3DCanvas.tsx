import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NodeData {
  id: string;
  label: string;
  type: 'Work' | 'Instance' | 'Agent' | 'Subject' | 'Item';
  color: number;
  position: [number, number, number];
}

interface WolfMoon3DCanvasProps {
  interactive?: boolean;
  intensity?: number;
  activeNode?: string;
  onSelectNode?: (nodeId: string) => void;
  recordTitle?: string;
  creatorName?: string;
}

export function WolfMoon3DCanvas({
  interactive = true,
  intensity = 1.0,
  activeNode,
  onSelectNode,
  recordTitle = 'لمحات اجتماعية',
  creatorName = 'علي الوردي'
}: WolfMoon3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8.5);

    // 2. Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed:', e);
      return;
    }

    // 3. Multi-Color Spatial Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x00f2fe, 10.0 * intensity, 25);
    cyanPoint.position.set(-5, 4, 4);
    scene.add(cyanPoint);

    const coralPoint = new THREE.PointLight(0xff5500, 8.0 * intensity, 25);
    coralPoint.position.set(5, -3, 3);
    scene.add(coralPoint);

    const purplePoint = new THREE.PointLight(0xa855f7, 7.0 * intensity, 25);
    purplePoint.position.set(0, 5, -4);
    scene.add(purplePoint);

    // 4. RDF Nodes Group
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Node definitions
    const nodes: NodeData[] = [
      { id: 'work', label: 'bf:Work', type: 'Work', color: 0x00f2fe, position: [0, 0.4, 0] },
      { id: 'instance', label: 'bf:Instance', type: 'Instance', color: 0x10b981, position: [2.6, -1.2, 0.5] },
      { id: 'agent', label: 'bf:Agent (LOC:n82027914)', type: 'Agent', color: 0xa855f7, position: [-2.6, 1.4, -0.4] },
      { id: 'subject1', label: 'bf:Topic (تاريخ العراق)', type: 'Subject', color: 0xffaa00, position: [-1.8, -1.8, 0.8] },
      { id: 'subject2', label: 'bf:Topic (علم الاجتماع)', type: 'Subject', color: 0xff007a, position: [1.8, 2.0, -0.6] },
      { id: 'item', label: 'bf:Item (Holdings)', type: 'Item', color: 0x3b82f6, position: [3.8, 0.2, -1.0] },
    ];

    const sphereMeshes: THREE.Mesh[] = [];

    nodes.forEach((node) => {
      const isCore = node.id === 'work';
      const radius = isCore ? 0.95 : 0.55;
      const geo = new THREE.SphereGeometry(radius, 48, 48);
      
      const mat = new THREE.MeshPhysicalMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.25,
        transmission: 0.88,
        transparent: true,
        roughness: 0.12,
        ior: 1.5,
        thickness: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      (mesh as any).nodeId = node.id;
      graphGroup.add(mesh);
      sphereMeshes.push(mesh);

      // Inner Core Glow Bead
      const coreGeo = new THREE.SphereGeometry(radius * 0.35, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      mesh.add(coreMesh);

      // Orbital Chromatic Halo Ring around Work
      if (isCore) {
        const ringGeo = new THREE.TorusGeometry(1.4, 0.025, 16, 80);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        mesh.add(ring);
      }
    });

    // 5. Connecting RDF Edges (Glowing Laser Lines)
    const edgePairs: [number, number][] = [
      [0, 1], // Work -> Instance
      [0, 2], // Work -> Agent
      [0, 3], // Work -> Subject1
      [0, 4], // Work -> Subject2
      [1, 5], // Instance -> Item
    ];

    const edgeLines: THREE.Line[] = [];
    edgePairs.forEach(([srcIdx, dstIdx]) => {
      const src = nodes[srcIdx].position;
      const dst = nodes[dstIdx].position;
      const points = [new THREE.Vector3(...src), new THREE.Vector3(...dst)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.45,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      graphGroup.add(line);
      edgeLines.push(line);
    });

    // 6. Ambient Particle Cloud
    const partCount = 150;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i += 3) {
      partPos[i] = (Math.random() - 0.5) * 14;
      partPos[i + 1] = (Math.random() - 0.5) * 10;
      partPos[i + 2] = (Math.random() - 0.5) * 8;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // 7. Interactive Mouse Controls
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Gentle floating graph rotation
      graphGroup.rotation.y = t * 0.1 + targetX * 0.4;
      graphGroup.rotation.x = Math.sin(t * 0.15) * 0.15 + targetY * 0.3;

      // Floating oscillation on individual nodes
      sphereMeshes.forEach((mesh, idx) => {
        mesh.position.y += Math.sin(t * 1.5 + idx) * 0.0015;
      });

      particles.rotation.y = t * 0.03;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, [interactive, intensity]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
}
