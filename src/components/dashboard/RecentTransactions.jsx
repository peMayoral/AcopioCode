import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecentTransactions({ compras = [], ventas = [] }) {
  const transactions = [
    ...compras.map(c => ({ ...c, tipo: 'compra' })),
    ...ventas.map(v => ({ ...v, tipo: 'venta' }))
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Últimas Operaciones</h3>
        <p className="text-sm text-slate-400 text-center py-8">
          No hay operaciones registradas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Últimas Operaciones</h3>
      <div className="space-y-3">
        {transactions.map((t, index) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${t.tipo === 'compra' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {t.tipo === 'compra' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div>
                <p className="font-medium text-slate-700 text-sm">
                  {t.tipo === 'compra' ? t.proveedor_nombre : t.comprador}
                </p>
                <p className="text-xs text-slate-400">
                  {format(new Date(t.fecha), "d MMM yyyy", { locale: es })} · {t.cantidad_total_animales || 0} animales
                </p>
              </div>
            </div>
            <div className={`font-semibold ${t.tipo === 'compra' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {t.tipo === 'compra' ? '-' : '+'}${(t.total_compra || t.total_venta || 0).toLocaleString('es-AR')}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}