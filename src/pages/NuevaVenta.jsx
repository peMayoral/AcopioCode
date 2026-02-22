import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import VentaAnimalForm from '../components/ventas/VentaAnimalForm';
import PlazosForm from '../components/plazos/PlazosForm';
import NumericInput from '../components/ui/NumericInput';

export default function NuevaVenta() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [comprador, setComprador] = useState('');
  const [animales, setAnimales] = useState([{ categoria: '', cantidad: 1, peso_total_kg: 0, precio_por_kg: 0, subtotal: 0, aplica_iva: false, iva_monto: 0 }]);
  const [aplicaIva, setAplicaIva] = useState(false);
  const [gastosVenta, setGastosVenta] = useState(0);
  const [descripcionGastos, setDescripcionGastos] = useState('');
  const [notas, setNotas] = useState('');
  const [plazos, setPlazos] = useState([]);
  const [ajusteManual, setAjusteManual] = useState(null);

  // subtotal SIN IVA
  const subtotalVentaBase = animales.reduce((sum, a) => sum + (a.subtotal || 0), 0);
  // IVA individual por animal
  const ivaIndividualAnimales = animales.reduce((sum, a) => sum + (a.iva_monto || 0), 0);
  // IVA global
  const ivaVenta = aplicaIva ? subtotalVentaBase * 0.105 : 0;
  const subtotalVenta = subtotalVentaBase + ivaIndividualAnimales;
  const totalVentaCalculado = subtotalVenta + ivaVenta - gastosVenta;
  const totalVenta = ajusteManual !== null ? ajusteManual : totalVentaCalculado;
  const cantidadTotalAnimales = animales.reduce((sum, a) => sum + (a.cantidad || 0), 0);
  const pesoTotal = animales.reduce((sum, a) => sum + (a.peso_total_kg || 0), 0);
  const precioPorKgFinal = pesoTotal > 0 ? totalVenta / pesoTotal : 0;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Venta.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['ventas']); navigate(createPageUrl('Ventas')); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      fecha, comprador, animales,
      subtotal_venta: subtotalVenta, aplica_iva: aplicaIva, iva_venta: ivaVenta,
      gastos_venta: gastosVenta, descripcion_gastos: descripcionGastos,
      total_venta: totalVenta, notas, plazos_pago: plazos,
      cantidad_total_animales: cantidadTotalAnimales, peso_total: pesoTotal
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button variant="ghost" onClick={() => navigate(createPageUrl('Ventas'))} className="mb-4 text-slate-600">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Nueva Venta</h1>
          <p className="text-slate-500 mt-1">Registrar una venta de hacienda</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Datos de la Venta</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-600">Fecha de Venta</Label>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label className="text-slate-600">Comprador</Label>
                <Input value={comprador} onChange={(e) => setComprador(e.target.value)} placeholder="Nombre del comprador" className="mt-1" required />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <VentaAnimalForm animales={animales} setAnimales={setAnimales} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">IVA General y Gastos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Checkbox id="ivaVenta" checked={aplicaIva} onCheckedChange={setAplicaIva} />
                  <Label htmlFor="ivaVenta" className="text-sm cursor-pointer">Aplicar IVA 10.5% global</Label>
                </div>
                {aplicaIva && <div className="pl-6 text-sm text-slate-500">IVA: ${ivaVenta.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>}
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-600">Gastos de Venta (a descontar)</Label>
                  <NumericInput value={gastosVenta} onChange={setGastosVenta} className="mt-1" />
                </div>
                <div>
                  <Label className="text-slate-600">Descripción de Gastos</Label>
                  <Input value={descripcionGastos} onChange={(e) => setDescripcionGastos(e.target.value)} placeholder="Comisiones, flete, etc." className="mt-1" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <PlazosForm plazos={plazos} setPlazos={setPlazos} totalReferencia={totalVenta} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Notas</h2>
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas adicionales..." rows={2} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Resumen de la Venta</h2>
            <div className="space-y-2 text-emerald-100">
              <div className="flex justify-between"><span>Subtotal Animales sin IVA ({cantidadTotalAnimales} cab. / {pesoTotal.toLocaleString('es-AR')} kg)</span><span>${subtotalVentaBase.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></div>
              {ivaIndividualAnimales > 0 && <div className="flex justify-between text-amber-300"><span>IVA individual animales (10.5%)</span><span>+${ivaIndividualAnimales.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></div>}
              {aplicaIva && <div className="flex justify-between text-amber-300"><span>IVA Global (10.5%)</span><span>+${ivaVenta.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></div>}
              {gastosVenta > 0 && <div className="flex justify-between"><span>Gastos de Venta</span><span>-${gastosVenta.toLocaleString('es-AR')}</span></div>}
              <div className="border-t border-emerald-600 pt-3 mt-3">
                <div className="flex justify-between text-base text-emerald-200 mb-2">
                  <span>Total calculado</span><span>${totalVentaCalculado.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-emerald-200">Corrección manual (opcional)</span>
                  <NumericInput
                    value={ajusteManual ?? ''}
                    onChange={(v) => setAjusteManual(v || null)}
                    className="w-40 bg-emerald-600 border-emerald-400 text-white placeholder:text-emerald-300"
                    placeholder="Dejar vacío = auto"
                  />
                </div>
                {ajusteManual !== null && (
                  <div className="text-xs text-amber-300 mt-1">
                    Diferencia: ${(ajusteManual - totalVentaCalculado).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                    <button className="ml-2 underline text-emerald-300" onClick={() => setAjusteManual(null)}>resetear</button>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white mt-3">
                  <span>TOTAL NETO</span><span>${totalVenta.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                </div>
                {pesoTotal > 0 && (
                  <div className="flex justify-between text-sm text-emerald-300 mt-1">
                    <span>Precio final por kg</span>
                    <span className="text-white font-semibold">${precioPorKgFinal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}/kg</span>
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full mt-6 bg-white hover:bg-emerald-50 text-emerald-700 h-12 text-lg" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Guardar Venta
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}