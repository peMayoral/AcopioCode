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
import { ArrowLeft, Calendar, User, Scale, DollarSign, Truck, FileText, CreditCard } from 'lucide-react';

const CONCEPTOS_LABELS = {
  tasas_provinciales: 'Tasas Provinciales',
  nafta_particular: 'Nafta Particular',
  rollos: 'Rollos',
  veterinaria: 'Veterinaria',
  pago_empleado: 'Pago a Empleado',
  pago_contador: 'Pago al Contador',
  marcas_senal: 'Marcas y Señal',
  rentas: 'Rentas',
  senasa: 'SENASA',
  otro: 'Otro',
};

const CATEGORIAS_LABELS = {
  novillo: 'Novillo',
  toro: 'Toro',
  ternero: 'Ternero',
  ternera: 'Ternera',
  vaca: 'Vaca',
  vaquillona: 'Vaquillona',
};

export default function DetalleCompra() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const { data: compra, isLoading } = useQuery({
    queryKey: ['compra', id],
    queryFn: () => base44.entities.Compra.filter({ id }),
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

  if (!compra) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-500">Compra no encontrada</p>
          <Button onClick={() => navigate(createPageUrl('Compras'))} className="mt-4">
            Volver a Compras
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
            onClick={() => navigate(createPageUrl('Compras'))}
            className="mb-4 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{compra.proveedor_nombre}</h1>
              <div className="flex items-center gap-2 mt-2 text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(compra.fecha), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total de la compra</p>
              <p className="text-3xl font-bold text-slate-800">
                ${(compra.total_compra || 0).toLocaleString('es-AR')}
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
            Detalle de Animales
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-500 border-b">
                  <th className="pb-3 font-medium">Categoría</th>
                  <th className="pb-3 font-medium">Cant.</th>
                  <th className="pb-3 font-medium">Peso Bruto</th>
                  <th className="pb-3 font-medium">Desbaste</th>
                  <th className="pb-3 font-medium">Peso Neto</th>
                  <th className="pb-3 font-medium">$/kg</th>
                  <th className="pb-3 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {compra.animales?.map((a, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 font-medium">{CATEGORIAS_LABELS[a.categoria] || a.categoria}</td>
                    <td className="py-3">{a.cantidad}</td>
                    <td className="py-3">{a.peso_bruto_kg?.toLocaleString('es-AR')} kg</td>
                    <td className="py-3">{a.desbaste_porcentaje}%</td>
                    <td className="py-3">{a.peso_neto_kg?.toLocaleString('es-AR')} kg</td>
                    <td className="py-3">${a.precio_por_kg?.toLocaleString('es-AR')}</td>
                    <td className="py-3 text-right font-semibold">${a.subtotal?.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan={6} className="py-3 font-medium">Total Animales</td>
                  <td className="py-3 text-right font-bold">${compra.subtotal_animales?.toLocaleString('es-AR')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="flex gap-4 mt-4 flex-wrap">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
              {compra.cantidad_total_animales} cabezas
            </Badge>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {compra.peso_total_neto?.toLocaleString('es-AR')} kg netos
            </Badge>
          </div>
        </motion.div>

        {/* IVA y Comisiones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-600" />
            IVA, Comisiones y Flete
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {compra.aplica_iva_hacienda && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">IVA Hacienda (10.5%)</p>
                <p className="text-lg font-semibold text-slate-800">
                  ${compra.iva_hacienda?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
            
            {compra.comision_asociado > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Comisión Asociado</p>
                <p className="text-lg font-semibold text-slate-800">
                  ${compra.comision_asociado?.toLocaleString('es-AR')}
                </p>
              </div>
            )}
            
            {compra.costo_flete > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Flete</p>
                <p className="text-lg font-semibold text-slate-800">
                  ${compra.costo_flete?.toLocaleString('es-AR')}
                </p>
              </div>
            )}
            
            {compra.aplica_iva_flete && compra.iva_flete > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">IVA Flete (21%)</p>
                <p className="text-lg font-semibold text-slate-800">
                  ${compra.iva_flete?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Gastos Adicionales */}
        {compra.gastos_adicionales?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Gastos Adicionales
            </h2>
            
            <div className="space-y-2">
              {compra.gastos_adicionales.map((g, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">
                    {CONCEPTOS_LABELS[g.concepto] || g.concepto}
                    {g.descripcion && <span className="text-slate-400 ml-2">({g.descripcion})</span>}
                  </span>
                  <span className="font-semibold">${g.monto?.toLocaleString('es-AR')}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg mt-2">
                <span className="font-medium text-amber-800">Total Gastos Adicionales</span>
                <span className="font-bold text-amber-800">
                  ${compra.total_gastos_adicionales?.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Medio de Pago */}
        {compra.medio_pago && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Medio de Pago
            </h2>
            <Badge variant="secondary" className="capitalize text-base px-4 py-2">
              {compra.medio_pago}
            </Badge>
            {compra.notas_pago && (
              <p className="mt-3 text-slate-500">{compra.notas_pago}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}