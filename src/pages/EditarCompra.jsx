import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export default function EditarCompra() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const { data: compra, isLoading } = useQuery({
    queryKey: ['compra', id],
    queryFn: () => base44.entities.Compra.filter({ id }),
    enabled: !!id,
    select: (data) => data[0]
  });

  const [fecha, setFecha] = useState('');
  const [proveedorNombre, setProveedorNombre] = useState('');
  const [animales, setAnimales] = useState([]);
  const [aplicaIvaHacienda, setAplicaIvaHacienda] = useState(false);
  const [comisionAsociado, setComisionAsociado] = useState(0);
  const [porcentajeComision, setPorcentajeComision] = useState(0);
  const [costoFlete, setCostoFlete] = useState(0);
  const [fleteConIvaIncluido, setFleteConIvaIncluido] = useState(false);
  const [gastosAdicionales, setGastosAdicionales] = useState([]);
  const [medioPago, setMedioPago] = useState('');
  const [notasPago, setNotasPago] = useState('');
  const [plazos, setPlazos] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (compra && !initialized) {
      setFecha(compra.fecha || '');
      setProveedorNombre(compra.proveedor_nombre || '');
      setAnimales(compra.animales || []);
      setAplicaIvaHacienda(compra.aplica_iva_hacienda || false);
      setComisionAsociado(compra.comision_asociado || 0);
      setCostoFlete(compra.costo_flete || 0);
      setFleteConIvaIncluido(compra.flete_con_iva_incluido || false);
      setGastosAdicionales(compra.gastos_adicionales || []);
      setMedioPago(compra.medio_pago || '');
      setNotasPago(compra.notas_pago || '');
      setPlazos(compra.plazos_pago || []);
      setInitialized(true);
    }
  }, [compra, initialized]);

  const subtotalAnimales = animales.reduce((sum, a) => sum + (a.subtotal || 0), 0);
  const ivaHacienda = aplicaIvaHacienda ? subtotalAnimales * 0.105 : 0;
  const ivaFleteIncluido = fleteConIvaIncluido ? costoFlete - costoFlete / 1.21 : 0;
  const totalGastosAdicionales = gastosAdicionales.reduce((sum, g) => sum + (g.monto || 0), 0);
  const totalCompra = subtotalAnimales + ivaHacienda + comisionAsociado + costoFlete + totalGastosAdicionales;
  const cantidadTotalAnimales = animales.reduce((sum, a) => sum + (a.cantidad || 0), 0);
  const pesoTotalNeto = animales.reduce((sum, a) => sum + (a.peso_neto_kg || 0), 0);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Compra.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['compras']);
      queryClient.invalidateQueries(['compra', id]);
      navigate(createPageUrl('Compras'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      fecha, proveedor_nombre: proveedorNombre, animales,
      subtotal_animales: subtotalAnimales, aplica_iva_hacienda: aplicaIvaHacienda,
      iva_hacienda: ivaHacienda, comision_asociado: comisionAsociado,
      costo_flete: costoFlete, flete_con_iva_incluido: fleteConIvaIncluido, iva_flete: ivaFleteIncluido,
      gastos_adicionales: gastosAdicionales, total_gastos_adicionales: totalGastosAdicionales,
      medio_pago: medioPago, notas_pago: notasPago, plazos_pago: plazos,
      total_compra: totalCompra, cantidad_total_animales: cantidadTotalAnimales, peso_total_neto: pesoTotalNeto
    });
  };

  if (isLoading || !initialized) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button variant="ghost" onClick={() => navigate(createPageUrl('Compras'))} className="mb-4 text-slate-600">
            <ArrowLeft className="h-4 w-4 mr-2" />Volver
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Editar Compra</h1>
          <p className="text-slate-500 mt-1">Modificar registro de compra</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <AnimalForm animales={animales} setAnimales={setAnimales} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">IVA, Comisiones y Flete</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Checkbox id="ivaHacienda" checked={aplicaIvaHacienda} onCheckedChange={setAplicaIvaHacienda} />
                  <Label htmlFor="ivaHacienda" className="text-sm cursor-pointer">Aplicar IVA 10.5% a la hacienda</Label>
                </div>
                {aplicaIvaHacienda && <div className="pl-6 text-sm text-slate-500">IVA Hacienda: ${ivaHacienda.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</div>}

                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <Label className="text-slate-600 font-medium">Comisión del Asociado</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-500">% Comisión</Label>
                      <NumericInput value={porcentajeComision} onChange={(v) => { setPorcentajeComision(v); setComisionAsociado(Math.round(subtotalAnimales * v / 100 * 100) / 100); }} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Monto ($)</Label>
                      <NumericInput value={comisionAsociado} onChange={setComisionAsociado} className="mt-1" />
                    </div>
                  </div>
                  {porcentajeComision > 0 && <p className="text-xs text-slate-400">Base (hacienda sin IVA): ${subtotalAnimales.toLocaleString('es-AR')}</p>}
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
                  <div className="pl-6 text-sm text-slate-500">
                    <span>IVA incluido: ${ivaFleteIncluido.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                    <br /><span>Neto sin IVA: ${(costoFlete - ivaFleteIncluido).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <GastosAdicionalesForm gastos={gastosAdicionales} setGastos={setGastosAdicionales} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <PlazosForm plazos={plazos} setPlazos={setPlazos} totalReferencia={totalCompra} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Medio de Pago</h2>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Resumen de la Compra</h2>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between"><span>Subtotal Animales ({cantidadTotalAnimales} cab.)</span><span>${subtotalAnimales.toLocaleString('es-AR')}</span></div>
              {aplicaIvaHacienda && <div className="flex justify-between"><span>IVA Hacienda (10.5%)</span><span>${ivaHacienda.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></div>}
              {comisionAsociado > 0 && <div className="flex justify-between"><span>Comisión Asociado</span><span>${comisionAsociado.toLocaleString('es-AR')}</span></div>}
              {costoFlete > 0 && <div className="flex justify-between"><span>Flete {fleteConIvaIncluido ? '(IVA incluido)' : ''}</span><span>${costoFlete.toLocaleString('es-AR')}</span></div>}
              {totalGastosAdicionales > 0 && <div className="flex justify-between"><span>Gastos Adicionales</span><span>${totalGastosAdicionales.toLocaleString('es-AR')}</span></div>}
              <div className="border-t border-slate-600 pt-3 mt-3 flex justify-between text-xl font-bold text-white">
                <span>TOTAL</span><span>${totalCompra.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <Button type="submit" className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-lg" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Guardar Cambios
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}