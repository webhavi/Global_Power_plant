import React, { useState, useEffect, Suspense, useRef, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { formatCapacity } from '../utils/helpers';

const FUEL_COLORS = {
  'Solar': '#fbbf24', 'Wind': '#22d3ee', 'Hydro': '#3b82f6', 'Gas': '#a78bfa',
  'Oil': '#f97316', 'Coal': '#6b7280', 'Nuclear': '#ef4444', 'Biomass': '#84cc16',
  'Waste': '#ec4899', 'Geothermal': '#f43f5e', 'Cogeneration': '#8b5cf6',
  'Peat': '#78716c', 'Storage': '#06b6d4', 'Other': '#64748b'
};

function latLngToVec3(lat, lng, radius = 2.0) {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  return [
    radius * Math.cos(latRad) * Math.cos(lngRad),
    radius * Math.sin(latRad),
    -radius * Math.cos(latRad) * Math.sin(lngRad)
  ];
}

function InstancedMarkers({ plants }) {
  const meshRef = useRef();
  const count = plants.length;

  const { colorArray, dummy, matrix } = useMemo(() => {
    const colorArray = new Float32Array(count * 3);
    const dummy = new THREE.Object3D();
    const matrix = new THREE.Matrix4();
    return { colorArray, dummy, matrix };
  }, [count]);

  useEffect(() => {
    if (!meshRef.current) return;
    plants.forEach((plant, i) => {
      const [x, y, z] = latLngToVec3(plant.latitude, plant.longitude, 2.02);
      dummy.position.set(x, y, z);
      dummy.lookAt(0, 0, 0);
      const s = Math.max(0.015, Math.min(0.05, (plant.capacity_mw || 100) / 5000));
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const col = new THREE.Color(FUEL_COLORS[plant.primary_fuel] || '#666');
      colorArray[i * 3] = col.r;
      colorArray[i * 3 + 1] = col.g;
      colorArray[i * 3 + 2] = col.b;
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray, 3));
  }, [plants, colorArray, dummy]);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.001;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial vertexColors emissiveIntensity={0.8} toneMapped={false} />
    </instancedMesh>
  );
}

function GridLines() {
  const lines = useMemo(() => {
    const result = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      for (let lng = -180; lng <= 180; lng += 5) {
        const [x, y, z] = latLngToVec3(lat, lng, 2.005);
        pts.push(new THREE.Vector3(x, y, z));
      }
      result.push(pts);
    }
    for (let lng = -180; lng < 180; lng += 30) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        const [x, y, z] = latLngToVec3(lat, lng, 2.005);
        pts.push(new THREE.Vector3(x, y, z));
      }
      result.push(pts);
    }
    return result;
  }, []);

  return (
    <>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#3b8eff" lineWidth={0.3} transparent opacity={0.08} />
      ))}
    </>
  );
}

function GlobeMesh() {
  const meshRef = useRef();
  const glowRef = useRef();
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.001;
    if (glowRef.current) glowRef.current.rotation.y += 0.001;
  });

  return (
    <>
      <group ref={meshRef}>
        <Sphere args={[1.98, 64, 64]}>
          <meshStandardMaterial color="#0f1923" roughness={0.9} metalness={0.1} />
        </Sphere>
        <GridLines />
      </group>
      <group ref={glowRef}>
        <Sphere args={[2.03, 64, 64]}>
          <meshStandardMaterial color="#3b8eff" transparent opacity={0.02} side={THREE.BackSide} />
        </Sphere>
        <Sphere args={[2.06, 64, 64]}>
          <meshStandardMaterial color="#1b65f5" transparent opacity={0.01} side={THREE.BackSide} />
        </Sphere>
      </group>
    </>
  );
}

function HoverInfo({ plants }) {
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const [info, setInfo] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.02, 64, 64),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    const onMove = (e) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setPos({ x: e.clientX, y: e.clientY });
    };
    gl.domElement.addEventListener('mousemove', onMove);
    return () => gl.domElement.removeEventListener('mousemove', onMove);
  }, [gl, mouse, raycaster, camera]);

  return null;
}

function GlobeScene({ plants }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <pointLight position={[-10, -5, -10]} intensity={0.8} color="#3b8eff" />
      <pointLight position={[0, -10, 0]} intensity={0.3} color="#f59e0b" />
      <GlobeMesh />
      <InstancedMarkers plants={plants} />
      <OrbitControls enableZoom enablePan minDistance={2.8} maxDistance={6} autoRotate autoRotateSpeed={0.4} enableDamping dampingFactor={0.05} />
    </>
  );
}

function GlobeErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <div className="w-20 h-20 rounded-2xl bg-primary-600/20 flex items-center justify-center animate-breathe">
        <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
      </div>
      <h3 className="text-xl font-bold text-white">WebGL Required</h3>
      <p className="text-dark-300 max-w-md">Your browser or device doesn't support WebGL 3D rendering. Try using Chrome, Firefox, or Edge on a desktop device.</p>
    </div>
  );
}

class GlobeErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? <GlobeErrorFallback /> : this.props.children; }
}

export default function MapView() {
  const [plants, setPlants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [activeFuel, setActiveFuel] = useState('');
  const [loading, setLoading] = useState(true);
  const [webglError, setWebglError] = useState(false);
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const chipsRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { setWebglError(true); setLoading(false); return; }

    api.get('/analytics/all-map-data', { params: { limit: 5000 } }).then(res => {
      const data = res.data;
      setPlants(data);
      setFiltered(data);
      setFuels([...new Set(data.map(p => p.primary_fuel))].sort());
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && !webglError) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo(containerRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      if (chipsRef.current) {
        gsap.fromTo(chipsRef.current.children,
          { opacity: 0, y: 10, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.04, delay: 0.4, ease: 'back.out(1.3)' }
        );
      }
      if (statsRef.current) {
        gsap.fromTo(statsRef.current.children,
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, delay: 0.6, ease: 'power3.out' }
        );
      }
    }
  }, [loading, webglError]);

  useEffect(() => {
    setFiltered(activeFuel ? plants.filter(p => p.primary_fuel === activeFuel) : plants);
  }, [activeFuel, plants]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      <div className="dot-loading flex gap-2"><span /><span /><span /></div>
    </div>
  );

  if (webglError) return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <h1 className="text-3xl font-bold text-white mb-2">Global Map</h1>
        <p className="text-dark-300">{plants.length.toLocaleString()} power plants</p>
      </div>
      <GlobeErrorFallback />
    </div>
  );

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <h1 className="text-3xl font-bold text-white mb-2">Global Map</h1>
        <p className="text-dark-300">{filtered.length.toLocaleString()} power plants on 3D globe</p>
      </div>

      <div ref={chipsRef} className="flex flex-wrap gap-2">
        <button onClick={() => setActiveFuel('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all magnetic-btn ${!activeFuel ? 'bg-primary-600 text-white glow animate-scale-in' : 'bg-dark-800/50 text-dark-300 hover:text-white border border-dark-700/30'}`}>
          All ({plants.length})
        </button>
        {fuels.map(f => (
          <button key={f} onClick={() => setActiveFuel(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 magnetic-btn ${activeFuel === f ? 'bg-primary-600 text-white glow animate-scale-in' : 'bg-dark-800/50 text-dark-300 hover:text-white border border-dark-700/30'}`}>
            <span className="w-2 h-2 rounded-full" style={{ background: FUEL_COLORS[f] || '#666' }} />
            {f}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="glass-card overflow-hidden card-lift relative" style={{ height: 560 }}>
        <GlobeErrorBoundary>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-sm text-dark-400">Loading 3D globe...</p>
            </div>
          }>
            <Canvas camera={{ position: [0, 0, 4.5], fov: 45, near: 0.1, far: 100 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.2; }}>
              <GlobeScene plants={filtered} />
            </Canvas>
          </Suspense>
        </GlobeErrorBoundary>
        <div className="absolute bottom-3 left-3 bg-dark-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-dark-400 border border-dark-700/30">
          Drag to rotate | Scroll to zoom | {filtered.length.toLocaleString()} markers
        </div>
      </div>

      <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fuels.slice(0, 8).map(f => (
          <div key={f} className="flex items-center gap-2 bg-dark-800/50 rounded-lg px-3 py-2 border border-dark-700/30 card-lift cursor-default">
            <span className="w-3 h-3 rounded-full animate-breathe" style={{ background: FUEL_COLORS[f] || '#666' }} />
            <span className="text-xs text-dark-200">{f}</span>
            <span className="text-xs text-dark-400 ml-auto font-mono">{plants.filter(p => p.primary_fuel === f).length}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
