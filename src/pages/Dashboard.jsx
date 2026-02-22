import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign,
  Scale,
  AlertTriangle
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';

export default function Dashboard() {
  const { data: compras = [] } = useQuery({
    queryKey: ['compras'],
    queryFn: () => base44.entities.Compra.list('-fecha', 100),
  });

  const { data: ventas = [] } = useQuery({
    queryKey: ['ventas'],
    queryFn: () => base44.entities.Venta.list('-fecha', 100),
  });

  const { data: gastosExt = [] } = useQuery({
    queryKey: ['gastos_extraordinarios'],
    queryFn: () => base44.entities.GastoExtraordinario.list('-fecha', 200),
  });

  const { data: mortandades = [] } = useQuery({
    queryKey: ['mortandades'],
    queryFn: () => base44.entities.Mortandad.list('-fecha', 200),
  });

  // Cálculos
  const totalCompras = compras.reduce((sum, c) => sum + (c.total_compra || 0), 0);
  const totalVentas = ventas.reduce((sum, v) => sum + (v.total_venta || 0), 0);
  const totalGastosExt = gastosExt.reduce((sum, g) => sum + (g.monto || 0), 0);
  const ganancia = totalVentas - totalCompras - totalGastosExt;
  
  const animalesComprados = compras.reduce((sum, c) => sum + (c.cantidad_total_animales || 0), 0);
  const animalesVendidos = ventas.reduce((sum, v) => sum + (v.cantidad_total_animales || 0), 0);
  const totalMuertos = mortandades.reduce((sum, m) => sum + (m.cantidad || 0), 0);
  const stockActual = animalesComprados - animalesVendidos - totalMuertos;
  
  const pesoTotalComprado = compras.reduce((sum, c) => sum + (c.peso_total_neto || 0), 0);
  const pesoTotalVendido = ventas.reduce((sum, v) => sum + (v.peso_total || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Resumen de tu gestión ganadera</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            title="Total Comprado" 
            value={`$${totalCompras.toLocaleString('es-AR')}`}
            icon={TrendingDown}
            color="rose"
            delay={0}
          />
          <StatsCard 
            title="Total Vendido" 
            value={`$${totalVentas.toLocaleString('es-AR')}`}
            icon={TrendingUp}
            color="emerald"
            delay={0.1}
          />
          <StatsCard 
            title="Ganancia" 
            value={`$${ganancia.toLocaleString('es-AR')}`}
            subtitle={ganancia >= 0 ? 'positiva' : 'negativa'}
            icon={DollarSign}
            color={ganancia >= 0 ? 'emerald' : 'rose'}
            delay={0.2}
          />
          <Link to={createPageUrl('Stock')} className="contents">
            <StatsCard 
              title="Stock Actual" 
              value={stockActual.toLocaleString('es-AR')}
              subtitle="cabezas"
              icon={Package}
              color="blue"
              delay={0.3}
              clickable
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatsCard 
            title="Kg Comprados" 
            value={pesoTotalComprado.toLocaleString('es-AR')}
            subtitle="kg netos"
            icon={Scale}
            color="violet"
            delay={0.4}
          />
          <StatsCard 
            title="Kg Vendidos" 
            value={pesoTotalVendido.toLocaleString('es-AR')}
            subtitle="kg"
            icon={Scale}
            color="amber"
            delay={0.5}
          />
          <StatsCard
            title="Gastos Ext."
            value={`$${totalGastosExt.toLocaleString('es-AR')}`}
            icon={AlertTriangle}
            color="amber"
            delay={0.6}
          />
        </div>

        {/* Resumen por categoría */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <RecentTransactions compras={compras} ventas={ventas} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-100"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Resumen de Stock</h3>
            <div className="space-y-3">
              {['novillo', 'vaca', 'toro', 'ternero', 'ternera', 'vaquillona'].map((cat, idx) => {
                const compradosCat = compras.reduce((sum, c) => {
                  return sum + (c.animales?.filter(a => a.categoria === cat).reduce((s, a) => s + a.cantidad, 0) || 0);
                }, 0);
                const vendidosCat = ventas.reduce((sum, v) => {
                  return sum + (v.animales?.filter(a => a.categoria === cat).reduce((s, a) => s + a.cantidad, 0) || 0);
                }, 0);
                const stockCat = compradosCat - vendidosCat;
                
                if (compradosCat === 0 && vendidosCat === 0) return null;
                
                return (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <span className="capitalize text-slate-700 font-medium">{cat}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">Comprados: {compradosCat}</span>
                      <span className="text-slate-400">Vendidos: {vendidosCat}</span>
                      <span className={`font-semibold ${stockCat > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        Stock: {stockCat}
                      </span>
                    </div>
                  </div>
                );
              })}
              {compras.length === 0 && ventas.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">
                  No hay datos de stock aún
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}