import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import gsap from 'gsap';

function SkeletonRow() {
  return (
    <tr className="border-b border-dark-800/50">
      {Array(7).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>
      ))}
    </tr>
  );
}

export default function DataExplorer() {
  const [plants, setPlants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [fuelTypes, setFuelTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const tableRef = useRef(null);
  const headerRef = useRef(null);
  const filterRef = useRef(null);
  const paginationRef = useRef(null);

  const fetchData = () => {
    setLoading(true);
    const params = { page, page_size: 20, search, fuel_type: fuelType, sort_by: sortBy, sort_dir: sortDir };
    api.get('/plants', { params }).then(res => {
      setPlants(res.data.plants);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
      setTimeout(() => {
        if (tableRef.current) {
          const rows = tableRef.current.querySelectorAll('tr.data-row');
          gsap.fromTo(rows,
            { opacity: 0, x: -20, scale: 0.98 },
            { opacity: 1, x: 0, scale: 1, duration: 0.4, stagger: 0.03, ease: 'power3.out' }
          );
        }
      }, 50);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/plants/metadata').then(res => setFuelTypes(res.data.fuel_types));
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo(filterRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: 'power3.out' });
  }, []);

  useEffect(() => { fetchData(); }, [page, fuelType, sortBy, sortDir]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchData(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (paginationRef.current) {
      gsap.fromTo(paginationRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
  }, [page]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <h1 className="text-3xl font-bold text-white mb-2">Data Explorer</h1>
        <p className="text-dark-300">{total.toLocaleString()} power plants in database</p>
      </div>

      <div ref={filterRef} className="flex flex-col sm:flex-row gap-4">
        <div className={`relative flex-1 transition-all duration-300 ${searchFocused ? 'scale-[1.01]' : ''}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 transition-colors duration-300" style={searchFocused ? { color: '#3b8eff' } : {}} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search plants..."
            className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all" />
        </div>
        <select value={fuelType} onChange={e => { setFuelType(e.target.value); setPage(1); }}
          className="px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all min-w-[180px] magnetic-btn">
          <option value="">All Fuels</option>
          {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'country_long', label: 'Country' },
                  { key: 'primary_fuel', label: 'Fuel' },
                  { key: 'capacity_mw', label: 'Capacity (MW)' },
                  { key: 'latitude', label: 'Lat' },
                  { key: 'longitude', label: 'Lng' },
                  { key: 'commissioning_year', label: 'Year' }
                ].map(({ key, label }) => (
                  <th key={key} onClick={() => handleSort(key)} className="px-4 py-3 text-left text-sm font-medium text-dark-300 cursor-pointer hover:text-white transition-all duration-200 hover:bg-dark-800/30">
                    <span className="flex items-center gap-1">
                      {label}
                      {sortBy === key && (
                        <ArrowUpDown className="w-3 h-3 text-primary-400 animate-breathe" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody ref={tableRef}>
              {loading ? (
                Array(8).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : plants.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-dark-400 animate-fade-in-up">No plants found</td></tr>
              ) : plants.map((p, i) => (
                <tr key={i} className="data-row border-b border-dark-800/50 hover:bg-dark-800/30 transition-all duration-200 cursor-default">
                  <td className="px-4 py-3 text-sm text-white font-medium max-w-[200px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-dark-200">{p.country_long}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-600/20 text-primary-400 transition-all duration-200 hover:bg-primary-600/30">{p.primary_fuel}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-mono">{p.capacity_mw?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-dark-300 font-mono">{p.latitude?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-dark-300 font-mono">{p.longitude?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-dark-300">{p.commissioning_year?.toFixed(0) || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div ref={paginationRef} className="flex items-center justify-between">
        <p className="text-sm text-dark-400">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="p-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-dark-300 hover:text-white disabled:opacity-30 transition-all magnetic-btn">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            if (p > totalPages) return null;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all magnetic-btn ${p === page ? 'bg-primary-600 text-white glow animate-scale-in' : 'bg-dark-800/50 text-dark-300 hover:text-white hover:bg-dark-700/50'}`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-dark-300 hover:text-white disabled:opacity-30 transition-all magnetic-btn">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
