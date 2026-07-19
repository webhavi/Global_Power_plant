import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Zap, Database, BarChart3, Globe, Users, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import PageTransition from './PageTransition';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/predict', label: 'Predict', icon: Zap },
  { path: '/data', label: 'Data Explorer', icon: Database },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/map', label: '3D Map', icon: Globe },
  { path: '/users', label: 'Users', icon: Users },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);
  const logoRef = useRef(null);
  const navRef = useRef(null);
  const userRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
    }
    if (logoRef.current) {
      gsap.fromTo(logoRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, delay: 0.1, ease: 'back.out(1.5)' });
    }
    if (navRef.current) {
      gsap.fromTo(navRef.current.children,
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, delay: 0.2, ease: 'power3.out' }
      );
    }
    if (userRef.current) {
      gsap.fromTo(userRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.5, ease: 'power3.out' });
    }
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
  }, []);

  const handleLogout = () => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, { x: -20, opacity: 0, duration: 0.3, ease: 'power3.in', onComplete: () => { logout(); navigate('/login'); } });
    } else {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />}

      <aside ref={sidebarRef} className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass border-r border-dark-700/50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div ref={logoRef} className="p-6 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center glow animate-float">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Power Plant</h1>
              <p className="text-xs text-dark-300">Global Dashboard</p>
            </div>
          </div>
        </div>

        <nav ref={navRef} className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 magnetic-btn ${isActive ? 'bg-primary-600/20 text-primary-400 glow' : 'text-dark-300 hover:text-white hover:bg-dark-800/50'}`}
            >
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div ref={userRef} className="p-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center text-primary-400 text-sm font-bold transition-all duration-300 hover:scale-110 hover:bg-primary-600/50">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-dark-400">{user?.is_admin ? 'Admin' : 'User'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-dark-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 magnetic-btn">
            <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header ref={headerRef} className="glass border-b border-dark-700/50 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-dark-800 transition-all magnetic-btn">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-dark-300">Global Power Plant Dashboard</div>
        </header>

        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
