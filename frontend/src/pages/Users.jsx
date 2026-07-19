import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Crown, Search } from 'lucide-react';
import gsap from 'gsap';

function SkeletonUserRow() {
  return (
    <tr className="border-b border-dark-800/50">
      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="skeleton w-10 h-10 rounded-xl" /><div className="space-y-1"><div className="skeleton h-3 w-24" /><div className="skeleton h-2 w-16" /></div></div></td>
      <td className="px-4 py-3"><div className="skeleton h-3 w-32" /></td>
      <td className="px-4 py-3"><div className="skeleton h-6 w-16 rounded-lg" /></td>
      <td className="px-4 py-3"><div className="skeleton h-3 w-20" /></td>
      <td className="px-4 py-3"><div className="skeleton h-3 w-8" /></td>
    </tr>
  );
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo(searchRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: 'power3.out' });
    }
  }, [loading]);

  useEffect(() => {
    if (listRef.current) {
      const rows = listRef.current.querySelectorAll('tr.user-row');
      gsap.fromTo(rows,
        { opacity: 0, x: -20, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.4, stagger: 0.04, ease: 'power3.out' }
      );
    }
  }, [users, search]);

  const loadUsers = () => {
    api.get('/auth/users').then(res => {
      setUsers(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const filtered = users.filter(u => {
    const term = search.toLowerCase();
    return u.email?.toLowerCase().includes(term) || u.full_name?.toLowerCase().includes(term);
  });

  if (!currentUser?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-fade-in-up">
        <div className="animate-float mb-4">
          <Shield className="w-16 h-16 text-red-400/30" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-dark-300">Admin privileges required to view this page.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      <div className="dot-loading flex gap-2"><span /><span /><span /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-dark-300">{users.length} registered users</p>
      </div>

      <div ref={searchRef} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full pl-10 pr-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all focus:scale-[1.01]" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-300">Predictions</th>
              </tr>
            </thead>
            <tbody ref={listRef}>
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonUserRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-dark-400 animate-fade-in-up">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="user-row border-b border-dark-800/50 hover:bg-dark-800/30 transition-all duration-200 cursor-default">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 hover:scale-110 ${u.is_admin ? 'bg-amber-500/20 text-amber-400 animate-pulse-glow' : 'bg-primary-600/20 text-primary-400'}`}>
                        {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.full_name || 'N/A'}</p>
                        {u.id === currentUser?.id && <span className="text-xs text-primary-400 animate-breathe">(you)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-200">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 animate-pulse-glow">
                        <Crown className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-dark-700/50 text-dark-300">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-300">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-white font-mono">{u.prediction_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
