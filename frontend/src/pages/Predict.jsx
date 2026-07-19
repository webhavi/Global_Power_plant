import { useState, useEffect, useRef, Suspense } from 'react';
import api from '../api/axios';
import { Zap, MapPin, Calendar, Flame, Globe } from 'lucide-react';
import gsap from 'gsap';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import AnimatedCounter from '../components/AnimatedCounter';

function GlobeVisualization({ lat, lng, fuel }) {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const x = Math.cos(latRad) * Math.cos(lngRad) * 2.05;
  const y = Math.sin(latRad) * 2.05;
  const z = -Math.cos(latRad) * Math.sin(lngRad) * 2.05;

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial color="#1a2332" wireframe={false} />
      </Sphere>
      <Sphere args={[2.01, 32, 32]}>
        <meshStandardMaterial color="#1b65f5" transparent opacity={0.05} />
      </Sphere>
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#3b8eff" emissive="#3b8eff" emissiveIntensity={2} />
      </mesh>
      <Html position={[x * 1.2, y * 1.2, z * 1.2]}>
        <div className="bg-dark-900/90 backdrop-blur-sm border border-primary-500/30 rounded-lg px-3 py-1.5 text-xs text-white whitespace-nowrap pointer-events-none animate-fade-in-down">
          {fuel} Power Plant
        </div>
      </Html>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

function FormField({ children, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, x: -20, y: 10 }, { opacity: 1, x: 0, y: 0, duration: 0.5, delay, ease: 'power3.out' });
  }, []);
  return <div ref={ref}>{children}</div>;
}

export default function Predict() {
  const [fuelTypes, setFuelTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({ latitude: 28.6139, longitude: 77.2090, commissioning_year: 2015, primary_fuel: 'Solar', country: 'India' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const resultRef = useRef(null);
  const headerRef = useRef(null);
  const globeRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    api.get('/predict/meta').then(res => {
      setFuelTypes(res.data.fuel_types);
      setCountries(res.data.countries);
    });
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo(globeRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: 'back.out(1.3)' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setLoading(true);

    if (btnRef.current) {
      gsap.fromTo(btnRef.current, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    }

    try {
      const res = await api.post('/predict', form);
      setResult(res.data);
      setTimeout(() => {
        if (resultRef.current) {
          gsap.fromTo(resultRef.current, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' });
          gsap.fromTo(resultRef.current.querySelectorAll('.result-stat'),
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
          );
        }
      }, 100);
    } catch (err) {
      alert('Prediction failed: ' + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
    setPredicting(false);
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <h1 className="text-3xl font-bold text-white mb-2">Predict Capacity</h1>
        <p className="text-dark-300">Enter power plant details to predict its capacity in MW</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField delay={0.1}>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                  <MapPin className="w-4 h-4 text-primary-400" /> Latitude
                </label>
                <input type="number" step="any" value={form.latitude} onChange={e => update('latitude', parseFloat(e.target.value))} required
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all focus:scale-[1.02]" />
              </FormField>
              <FormField delay={0.15}>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                  <MapPin className="w-4 h-4 text-primary-400" /> Longitude
                </label>
                <input type="number" step="any" value={form.longitude} onChange={e => update('longitude', parseFloat(e.target.value))} required
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all focus:scale-[1.02]" />
              </FormField>
            </div>

            <FormField delay={0.2}>
              <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                <Calendar className="w-4 h-4 text-primary-400" /> Commissioning Year
              </label>
              <input type="number" min="1900" max="2025" value={form.commissioning_year} onChange={e => update('commissioning_year', parseInt(e.target.value))} required
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all focus:scale-[1.02]" />
            </FormField>

            <FormField delay={0.25}>
              <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                <Flame className="w-4 h-4 text-primary-400" /> Primary Fuel
              </label>
              <select value={form.primary_fuel} onChange={e => update('primary_fuel', e.target.value)}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all focus:scale-[1.02]">
                {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>

            <FormField delay={0.3}>
              <label className="flex items-center gap-2 text-sm font-medium text-dark-200 mb-2">
                <Globe className="w-4 h-4 text-primary-400" /> Country
              </label>
              <select value={form.country} onChange={e => update('country', e.target.value)}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all focus:scale-[1.02]">
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>

            <FormField delay={0.35}>
              <button ref={btnRef} type="submit" disabled={predicting}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50 glow magnetic-btn btn-ripple flex items-center justify-center gap-2">
                {predicting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Predicting...
                  </div>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Predict Capacity
                  </>
                )}
              </button>
            </FormField>
          </form>
        </div>

        <div className="space-y-6">
          <div ref={resultRef} className="glass-card p-6 glow animate-border-glow">
            <h3 className="text-lg font-semibold text-white mb-4">Prediction Result</h3>
            {result ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 animate-float">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <p className="text-5xl font-bold gradient-text mb-2 animate-fade-in-up">
                  <AnimatedCounter value={result.capacity_mw} duration={1.5} delay={0.2} /> MW
                </p>
                <p className="text-dark-300 animate-fade-in-up stagger-3">Predicted Capacity</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="result-stat bg-dark-800/50 rounded-xl p-3 card-lift">
                    <p className="text-xs text-dark-400">Fuel</p>
                    <p className="text-sm font-medium text-white">{result.primary_fuel}</p>
                  </div>
                  <div className="result-stat bg-dark-800/50 rounded-xl p-3 card-lift">
                    <p className="text-xs text-dark-400">Country</p>
                    <p className="text-sm font-medium text-white">{result.country}</p>
                  </div>
                  <div className="result-stat bg-dark-800/50 rounded-xl p-3 card-lift">
                    <p className="text-xs text-dark-400">Year</p>
                    <p className="text-sm font-medium text-white">{form.commissioning_year}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-dark-400">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-30 animate-breathe" />
                <p>Submit the form to see prediction</p>
              </div>
            )}
          </div>

          <div ref={globeRef} className="glass-card p-6 card-lift" style={{ height: 300 }}>
            <h3 className="text-lg font-semibold text-white mb-2">Location on Globe</h3>
            <Suspense fallback={<div className="flex items-center justify-center h-56"><div className="dot-loading flex gap-2"><span /><span /><span /></div></div>}>
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <GlobeVisualization lat={form.latitude} lng={form.longitude} fuel={form.primary_fuel} />
              </Canvas>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
