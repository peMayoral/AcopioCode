import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Scale, DollarSign, CreditCard } from 'lucide-react';

const CATEGORIAS_LABELS = {
  novillo: 'Novillo',
  toro: 'Toro',
  ternero: 'Ternero',
  ternera: 'Ternera',
  vaca: 'Vaca',
  vaquillona: 'Vaquillona',
};

export default function DetalleVenta() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const { data: venta, isLoading } = useQuery({
    queryKey: ['venta', id],
    queryFn: () => base44.entities.Venta.filter({ id }),
    enabled: !!id,
    select: (data) => data[0]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-500">Venta no encontrada</p>
          <Button onClick={() => navigate(createPageUrl('Ventas'))} className="mt-4">
            Volver a Ventas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(createPageUrl('Ventas'))}
            className="mb-4 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{venta.comprador}</h1>
              <div className="flex items-center gap-2 mt-2 text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(venta.fecha), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total de la venta</p>
              <p className="text-3xl font-bold text-emerald-600">
                ${(venta.total_venta || 0).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Animales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-600" />
            Detalle de Animales Vendidos
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-500 border-b">
                  <th className="pb-3 font-medium">Categoría</th>
                  <th className="pb-3 font-medium">Cantidad</th>
                  <th className="pb-3 font-medium">Peso Total</th>
                  <th className="pb-3 font-medium">$/kg</th>
                  <th className="pb-3 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {venta.animales?.map((a, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{CATEGORIAS_LABELS[a.categoria] || a.categoria}</td>
                    <td className="py-3">{a.cantidad}</td>
                    <td className="py-3">{a.peso_total_kg?.toLocaleString('es-AR')} kg</td>
                    <td className="py-3">${a.precio_por_kg?.toLocaleString('es-AR')}</td>
                    <td className="py-3 text-right font-semibold">${a.subtotal?.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan={4} className="py-3 font-medium">Subtotal</td>
                  <td className="py-3 text-right font-bold">${venta.subtotal_venta?.toLocaleString('es-AR')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="flex gap-4 mt-4 flex-wrap">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
              {venta.cantidad_total_animales} cabezas
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {venta.peso_total?.toLocaleString('es-AR')} kg
            </Badge>
          </div>
        </motion.div>

        {/* IVA y Gastos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-600" />
            IVA y Gastos
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {venta.aplica_iva && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">IVA (10.5%)</p>
                <p className="text-lg font-semibold text-slate-800">
                  +${venta.iva_venta?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
            
            {venta.gastos_venta > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Gastos de Venta</p>
                <p className="text-lg font-semibold text-red-600">
                  -${venta.gastos_venta?.toLocaleString('es-AR')}
                </p>
                {venta.descripcion_gastos && (
                  <p className="text-xs text-slate-400 mt-1">{venta.descripcion_gastos}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Medio de Pago */}
        {venta.medio_pago && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Medio de Pago
            </h2>
            <Badge variant="secondary" className="capitalize text-base px-4 py-2">
              {venta.medio_pago}
            </Badge>
            {venta.notas && (
              <p className="mt-3 text-slate-500">{venta.notas}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}