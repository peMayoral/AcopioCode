import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Package, 
  CalendarClock,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

const tabItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard', label: 'Inicio' },
  { name: 'Compras', icon: ArrowDownLeft, page: 'Compras', label: 'Compras' },
  { name: 'Ventas', icon: ArrowUpRight, page: 'Ventas', label: 'Ventas' },
  { name: 'Stock', icon: Package, page: 'Stock', label: 'Stock' },
  { name: 'Plazos', icon: CalendarClock, page: 'Vencimientos', label: 'Plazos' },
];

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Compras', icon: ArrowDownLeft, page: 'Compras' },
  { name: 'Ventas', icon: ArrowUpRight, page: 'Ventas' },
  { name: 'Stock', icon: Package, page: 'Stock' },
  { name: 'Plazos', icon: CalendarClock, page: 'Vencimientos' },
  { name: 'Gastos Ext.', icon: AlertTriangle, page: 'GastosExtraordinarios' },
];

const ROOT_PAGES = ['Dashboard', 'Compras', 'Ventas', 'Stock', 'Vencimientos', 'GastosExtraordinarios'];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootPage = ROOT_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen bg-slate-50 overscroll-none" style={{ overscrollBehaviorY: 'none' }}>
      {/* Mobile Header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-4 flex items-center"
        style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(56px + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between w-full h-14">
          {!isRootPage ? (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 select-none"
              style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Volver</span>
            </button>
          ) : (
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">Ganadería San Cristóbal</span>
            </Link>
          )}
          {!isRootPage && (
            <span className="font-semibold text-slate-700 text-sm absolute left-1/2 -translate-x-1/2">{currentPageName?.replace(/([A-Z])/g, ' $1').trim()}</span>
          )}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col z-50">
        <div className="h-16 px-6 flex items-center border-b border-slate-100">
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block">Ganadería San Cristóbal</span>
              <span className="text-xs text-slate-400">Gestión de Hacienda</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentPageName === item.page || 
                (item.page === 'Compras' && (currentPageName === 'NuevaCompra' || currentPageName === 'DetalleCompra' || currentPageName === 'EditarCompra')) ||
                (item.page === 'Ventas' && (currentPageName === 'NuevaVenta' || currentPageName === 'DetalleVenta' || currentPageName === 'EditarVenta'))
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white">
            <p className="text-sm font-medium">Sistema de Gestión</p>
            <p className="text-xs text-slate-400 mt-1">Control de hacienda integral</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen lg:pb-0"
        style={{
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
        }}
      >
        <style>{`@media (min-width: 1024px) { main { padding-top: 0 !important; padding-bottom: 0 !important; } }`}</style>
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {tabItems.map((item) => {
          const isActive = currentPageName === item.page ||
            (item.page === 'Compras' && (currentPageName === 'NuevaCompra' || currentPageName === 'DetalleCompra' || currentPageName === 'EditarCompra')) ||
            (item.page === 'Ventas' && (currentPageName === 'NuevaVenta' || currentPageName === 'DetalleVenta' || currentPageName === 'EditarVenta'));
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors select-none ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
              style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}