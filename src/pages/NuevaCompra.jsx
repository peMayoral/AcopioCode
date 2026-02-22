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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import AnimalForm from '../components/compras/AnimalForm';
import GastosAdicionalesForm from '../components/compras/GastosAdicionalesForm';
import PlazosForm from '../components/plazos/PlazosForm';
import NumericInput from '../components/ui/NumericInput';

const MEDIOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'pagare', label: 'Pagaré' },
  { value: 'otro', label: 'Otro' },
];

export default function NuevaCompra() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [proveedorNombre, setProveedorNombre] = useState('');
  const [animales, setAnimales] = useState([{ categoria: '', cantidad: 1, peso_bruto_kg: 0, desbaste_porcentaje: 3, peso_neto_kg: 0, precio_por_kg: 0, subtotal: 0, aplica_iva: false, iva_monto: 0 }]);
  const [aplicaIvaHacienda, setAplicaIvaHacienda] = useState(false);
  const [comisionAsociado, setComisionAsociado] = useState(0);
  const [porcentajeComision, setPorcentajeComision] = useState(0);
  const [costoFlete, setCostoFlete] = useState(0);
  const [fleteConIvaIncluido, setFleteConIvaIncluido] = useState(false);
  const [gastosAdicionales, setGastosAdicionales] = useState([]);
  const [medioPago, setMedioPago] = useState('');
  const [notasPago, setNotasPago] = useState('');
  const [plazos, setPlazos] = useState([]);
  const [ajusteManual, setAjusteManual] = useState(null); // null = usa cálculo automático

  // subtotal SIN IVA de cada animal
  const subtotalAnimalesBase = animales.reduce((sum, a) => sum + (a.subtotal || 0), 0);
  // IVA individual por animal (cuando aplica_iva en cada fila)
  const ivaIndividualAnimales = animales.reduce((sum, a) => sum + (a.iva_monto || 0), 0);
  // IVA global de hacienda (sobre base sin IVA individual)
  const ivaHacienda = aplicaIvaHacienda ? subtotalAnimalesBase * 0.105 : 0;
  const ivaFleteIncluido = fleteConIvaIncluido ? costoFlete - costoFlete / 1.21 : 0;
  const totalGastosAdicionales = gastosAdicionales.reduce((sum, g) => sum + (g.monto || 0), 0);
  const totalCompraCalculado = subtotalAnimalesBase + ivaIndividualAnimales + ivaHacienda + comisionAsociado + costoFlete + totalGastosAdicionales;
  const totalCompra = ajusteManual !== null ? ajusteManual : totalCompraCalculado;
  const cantidadTotalAnimales = animales.reduce((sum, a) => sum + (a.cantidad || 0), 0);
  const pesoTotalNeto = animales.reduce((sum, a) => sum + (a.peso_neto_kg || 0), 0);
  const precioPorKgFinal = pesoTotalNeto > 0 ? totalCompra / pesoTotalNeto : 0;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Compra.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['compras']); navigate(createPageUrl('Compras')); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      fecha, proveedor_nombre: proveedorNombre, animales,
      subtotal_animales: subtotalAnimales, aplica_iva_hacienda: aplicaIvaHacienda,
      iva_hacienda: ivaHacienda, comision_asociado: comisionAsociado,
      costo_flete: costoFlete, flete_con_iva_incluido: fleteConIvaIncluido, iva_flete: ivaFleteIncluido,
      gastos_adicionales: gastosAdicionales, total_gastos_adicionales: totalGastosAdicionales,
      medio_pago: medioPago, notas_pago: notasPago, plazos_pago: plazos,
      subtotal_animales: subtotalAnimalesBase,
      total_compra: totalCompra, cantidad_total_animales: cantidadTotalAnimales, peso_total_neto: pesoTotalNeto
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button variant="ghost" onClick={() => navigate(createPageUrl('Compras'))} className="mb-4 text-slate-600">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Nueva Compra</h1>
          <p className="text-slate-500 mt-1">Registrar una nueva consignación de hacienda</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos básicos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Datos de la Compra</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-600">Fecha de Compra</Label>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label className="text-slate-600">Campo / Proveedor</Label>
                <Input value={proveedorNombre} onChange={(e) => setProveedorNombre(e.target.value)} placeholder="Nombre del proveedor" className="mt-1" required />
              </div>
            </div>
          </motion.div>

          {/* Animales */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <AnimalForm animales={animales} setAnimales={setAnimales} />
          </motion.div>

          {/* IVA, Comisión, Flete */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">IVA General, Comisiones y Flete</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Checkbox id="ivaHacienda" checked={aplicaIvaHacienda} onCheckedChange={setAplicaIvaHacienda} />
                  <Label htmlFor="ivaHacienda" className="text-sm cursor-pointer">Aplicar IVA 10.5% global a la hacienda</Label>
                </div>
                {aplicaIvaHacienda && <div className="pl-6 text-sm text-slate-500">IVA Hacienda: ${ivaHacienda.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>}

                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <Label className="text-slate-600 font-medium">Comisión del Asociado</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-500">% Comisión</Label>
                      <NumericInput
                        value={porcentajeComision}
                        onChange={(v) => { setPorcentajeComision(v); setComisionAsociado(Math.round(subtotalAnimalesBase * v / 100 * 100) / 100); }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Monto ($)</Label>
                      <NumericInput value={comisionAsociado} onChange={setComisionAsociado} className="mt-1" />
                    </div>
                  </div>
                  {porcentajeComision > 0 && <p className="text-xs text-slate-400">Base (hacienda sin IVA): ${subtotalAnimalesBase.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-600">Costo del Flete</Label>
                  <NumericInput value={costoFlete} onChange={setCostoFlete} className="mt-1" />
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Checkbox id="ivaFlete" checked={fleteConIvaIncluido} onCheckedChange={setFleteConIvaIncluido} />
                  <Label htmlFor="ivaFlete" className="text-sm cursor-pointer">Flete con IVA incluido (21%)</Label>
                </div>
                {fleteConIvaIncluido && costoFlete > 0 && (
                  <div className="pl-6 text-sm text-slate-500 space-y-1">
                    <p>IVA incluido: ${ivaFleteIncluido.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
                    <p>Neto sin IVA: ${(costoFlete - ivaFleteIncluido).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Gastos adicionales */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <GastosAdicionalesForm gastos={gastosAdicionales} setGastos={setGastosAdicionales} />
          </motion.div>

          {/* Plazos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <PlazosForm plazos={plazos} setPlazos={setPlazos} totalReferencia={totalCompra} />
          </motion.div>

          {/* Medio de pago general */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Medio de Pago General</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-600">Forma de Pago</Label>
                <Select value={medioPago} onValueChange={setMedioPago}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{MEDIOS_PAGO.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-600">Notas del Pago</Label>
                <Textarea value={notasPago} onChange={(e) => setNotasPago(e.target.value)} placeholder="Detalles adicionales..." className="mt-1" rows={2} />
              </div>
            </div>
          </motion.div>

          {/* Resumen */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Resumen de la Compra</h2>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between"><span>Subtotal Animales sin IVA ({cantidadTotalAnimales} cab. / {pesoTotalNeto.toLocaleString('es-AR')} kg)</span><span>${subtotalAnimalesBase.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></div>
              {ivaIndividualAnimales > 0 && <div className="flex justify-between text-amber-300"><span>IVA individual animales (10.5%)</span><span>+${ivaIndividualAnimales.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></div>}
              {aplicaIvaHacienda && <div className="flex justify-between text-amber-300"><span>IVA Hacienda Global (10.5%)</span><span>+${ivaHacienda.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></div>}
              {comisionAsociado > 0 && <div className="flex justify-between"><span>Comisión Asociado</span><span>${comisionAsociado.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></div>}
              {costoFlete > 0 && <div className="flex justify-between"><span>Flete {fleteConIvaIncluido ? '(IVA incluido)' : ''}</span><span>${costoFlete.toLocaleString('es-AR')}</span></div>}
              {totalGastosAdicionales > 0 && <div className="flex justify-between"><span>Gastos Adicionales</span><span>${totalGastosAdicionales.toLocaleString('es-AR')}</span></div>}
              <div className="border-t border-slate-600 pt-3 mt-3">
                <div className="flex justify-between text-base text-slate-300 mb-2">
                  <span>Total calculado</span><span>${totalCompraCalculado.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-400">Corrección manual (opcional)</span>
                  <NumericInput
                    value={ajusteManual ?? ''}
                    onChange={(v) => setAjusteManual(v || null)}
                    className="w-40 bg-slate-700 border-slate-500 text-white placeholder:text-slate-400"
                    placeholder="Dejar vacío = auto"
                  />
                </div>
                {ajusteManual !== null && (
                  <div className="text-xs text-amber-300 mt-1">
                    Diferencia: ${(ajusteManual - totalCompraCalculado).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                    <button className="ml-2 underline text-slate-400" onClick={() => setAjusteManual(null)}>resetear</button>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white mt-3">
                  <span>TOTAL</span><span>${totalCompra.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                </div>
                {pesoTotalNeto > 0 && (
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>Precio final por kg (todos los gastos)</span>
                    <span className="text-white font-semibold">${precioPorKgFinal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}/kg</span>
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-lg" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Guardar Compra
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}