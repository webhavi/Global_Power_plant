import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { formatNumber, formatCapacity, FUEL_COLORS } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import gsap from 'gsap';

const ChartCard = ({ title, children, delay = 0, icon }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, delay, ease: 'power3.out' });
  }, []);
  return (
    <div ref={ref} className="glass-card p-6 card-lift gradient-border">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-primary-400">{icon}</span>}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const tooltipStyle = { background: '#2d2e33', border: '1px solid #3e4045', borderRadius: '12px', color: '#fff', fontSize: 13 };

export default function Analytics() {
  const [fuelDist, setFuelDist] = useState([]);
  const [capacityFuel, setCapacityFuel] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [yearlyTrend, setYearlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/fuel-distribution'),
      api.get('/analytics/capacity-by-fuel'),
      api.get('/analytics/top-countries'),
      api.get('/analytics/yearly-trend')
    ]).then(([f, c, tc, yt]) => {
      setFuelDist(f.data);
      setCapacityFuel(c.data);
      setTopCountries(tc.data);
      setYearlyTrend(yt.data.filter(d => d.year >= 1970));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    }
  }, [loading]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
      <div className="dot-loading flex gap-2"><span /><span /><span /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-dark-300">Interactive charts and insights from global power plant data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Fuel Type Distribution" delay={0.1}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={fuelDist} dataKey="count" nameKey="fuel_type" cx="50%" cy="50%" outerRadius={110}
                animationBegin={400} animationDuration={1200} animationEasing="ease-out"
                label={({ fuel_type, percent }) => `${fuel_type} ${(percent * 100).toFixed(0)}%`}>
                {fuelDist.map((e, i) => <Cell key={i} fill={FUEL_COLORS[e.fuel_type] || '#666'} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Capacity by Fuel Type" delay={0.2}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={capacityFuel} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2e33" />
              <XAxis dataKey="fuel_type" tick={{ fill: '#9ea0a5', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#9ea0a5' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCapacity(v), 'Avg Capacity']} />
              <Bar dataKey="avg_capacity" radius={[6, 6, 0, 0]} animationBegin={500} animationDuration={1000}>
                {capacityFuel.map((e, i) => <Cell key={i} fill={FUEL_COLORS[e.fuel_type] || '#666'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 20 Countries by Total Capacity" delay={0.3}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topCountries} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2e33" />
              <XAxis type="number" tick={{ fill: '#9ea0a5' }} />
              <YAxis dataKey="country" type="category" width={130} tick={{ fill: '#9ea0a5', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCapacity(v), 'Total']} />
              <Bar dataKey="total_capacity" fill="#3b8eff" radius={[0, 6, 6, 0]} animationBegin={600} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Capacity Commissioned Over Time" delay={0.4}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={yearlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2e33" />
              <XAxis dataKey="year" tick={{ fill: '#9ea0a5' }} />
              <YAxis tick={{ fill: '#9ea0a5' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total_capacity" stroke="#3b8eff" strokeWidth={2} dot={false} animationBegin={700} animationDuration={1500} />
              <Line type="monotone" dataKey="plant_count" stroke="#22c55e" strokeWidth={2} dot={false} yAxisId={0} animationBegin={900} animationDuration={1500} />
              <Legend wrapperStyle={{ color: '#9ea0a5' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
