import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { formatNumber, formatCapacity } from '../utils/helpers';
import { Zap, MapPin, Globe, Fuel, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FUEL_COLORS } from '../utils/helpers';
import gsap from 'gsap';
import AnimatedCounter from '../components/AnimatedCounter';

const KPICard = ({ icon: Icon, label, value, numericValue, color, delay, index }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: delay + 0.1, ease: 'back.out(1.4)' }
    );
  }, []);
  return (
    <div ref={ref} className="glass-card p-6 card-lift animate-pulse-glow cursor-default" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} animate-float`} style={{ animationDelay: `${index * 0.3}s` }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-dark-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">
            <AnimatedCounter value={numericValue} delay={delay + 0.3} duration={1.8} />
            {suffixFor(label)}
          </p>
        </div>
      </div>
    </div>
  );
};

function suffixFor(label) {
  if (label === 'Total Capacity') return ' MW';
  return '';
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [fuelData, setFuelData] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/fuel-distribution'),
      api.get('/analytics/top-countries')
    ]).then(([s, f, c]) => {
      setSummary(s.data);
      setFuelData(f.data.slice(0, 8));
      setTopCountries(c.data.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo(chart1Ref.current, { opacity: 0, x: -40, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.7, delay: 0.4, ease: 'power3.out' });
    gsap.fromTo(chart2Ref.current, { opacity: 0, x: 40, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.7, delay: 0.5, ease: 'power3.out' });
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, delay: 0.6, ease: 'back.out(1.2)' }
      );
    }
  }, [loading]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-primary-400/10 border-b-primary-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <div className="dot-loading flex gap-2">
        <span /><span /><span />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in-down">Dashboard</h1>
        <p className="text-dark-300 animate-fade-in-down stagger-2">Global power plant overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Zap} label="Total Plants" value={formatNumber(summary?.total_plants)} numericValue={summary?.total_plants} color="bg-primary-600/30" delay={0} index={0} />
        <KPICard icon={TrendingUp} label="Total Capacity" value={formatCapacity(summary?.total_capacity_mw)} numericValue={summary?.total_capacity_mw} color="bg-green-600/30" delay={0.1} index={1} />
        <KPICard icon={MapPin} label="Countries" value={summary?.total_countries} numericValue={summary?.total_countries} color="bg-amber-600/30" delay={0.2} index={2} />
        <KPICard icon={Fuel} label="Fuel Types" value={summary?.fuel_types} numericValue={summary?.fuel_types} color="bg-purple-600/30" delay={0.3} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div ref={chart1Ref} className="glass-card p-6 card-lift">
          <h3 className="text-lg font-semibold text-white mb-4">Plants by Fuel Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={fuelData} dataKey="count" nameKey="fuel_type" cx="50%" cy="50%" outerRadius={100}
                animationBegin={600} animationDuration={1200} animationEasing="ease-out"
                label={({ fuel_type, percent }) => `${fuel_type} ${(percent * 100).toFixed(0)}%`}>
                {fuelData.map((entry, i) => <Cell key={i} fill={FUEL_COLORS[entry.fuel_type] || '#666'} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#2d2e33', border: '1px solid #3e4045', borderRadius: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div ref={chart2Ref} className="glass-card p-6 card-lift">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries by Capacity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCountries} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: '#9ea0a5' }} />
              <YAxis dataKey="country" type="category" width={120} tick={{ fill: '#9ea0a5', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#2d2e33', border: '1px solid #3e4045', borderRadius: '12px', color: '#fff' }} formatter={(v) => formatCapacity(v)} />
              <Bar dataKey="total_capacity" fill="#3b8eff" radius={[0, 6, 6, 0]} animationBegin={800} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Average Capacity by Fuel Type</h3>
        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {fuelData.map((item, i) => (
            <div key={i} className="bg-dark-800/50 rounded-xl p-4 text-center border border-dark-700/30 card-lift gradient-border cursor-default">
              <div className="w-3 h-3 rounded-full mx-auto mb-2 animate-breathe" style={{ background: FUEL_COLORS[item.fuel_type] || '#666', animationDelay: `${i * 0.2}s` }} />
              <p className="text-xs text-dark-300 mb-1">{item.fuel_type}</p>
              <p className="text-lg font-bold text-white">
                <AnimatedCounter value={item.count} delay={0.7 + i * 0.05} duration={1.2} />
              </p>
              <p className="text-xs text-dark-400">plants</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
