import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Package, TrendingUp, TrendingDown, Plus, Trash2, Skull, SplitSquareHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsCard from '../components/dashboard/StatsCard';

const SUBCATEGORIAS = [
  { value: 'novillo', label: 'Novillo' },
  { value: 'toro', label: 'Toro' },
  { value: 'ternero', label: 'Ternero' },
  { value: 'ternera', label: 'Ternera' },
  { value: 'vaca', label: 'Vaca' },
  { value: 'vaquillona', label: 'Vaquillona' },
];

export default function Stock() {
  const queryClient = useQueryClient();
  const [showMortForm, setShowMortForm] = useState(false);
  const [mortForm, setMortForm] = useState({ fecha: new Date().toISOString().split('T')[0], categoria: 'mixto', cantidad: 1, descripcion: '' });
  // Discriminación manual del mixto
  const [desgloseMixto, setDesgloseMixto] = useState({});
  const [showDesglose, setShowDesglose] = useState(false);

  const { data: compras = [] } = useQuery({
    queryKey: ['compras'],
    queryFn: () => base44.entities.Compra.list('-fecha', 500),
  });
  const { data: ventas = [] } = useQuery({
    queryKey: ['ventas'],
    queryFn: () => base44.entities.Venta.list('-fecha', 500),
  });
  const { data: mortandades = [] } = useQuery({
    queryKey: ['mortandades'],
    queryFn: () => base44.entities.Mortandad.list('-fecha', 500),
  });

  const createMort = useMutation({
    mutationFn: (data) => base44.entities.Mortandad.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['mortandades']); setShowMortForm(false); setMortForm({ fecha: new Date().toISOString().split('T')[0], categoria: 'mixto', cantidad: 1, descripcion: '' }); }
  });
  const deleteMort = useMutation({
    mutationFn: (id) => base44.entities.Mortandad.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['mortandades']),
  });

  // Comprados totales por categoría (mixto distribuido manualmente via mortandad)
  const compradosPorCat = {};
  compras.forEach(c => {
    (c.animales || []).forEach(a => {
      const cat = a.categoria || 'mixto';
      if (!compradosPorCat[cat]) compradosPorCat[cat] = { cantidad: 0, kg: 0, valor: 0 };
      compradosPorCat[cat].cantidad += a.cantidad || 0;
      compradosPorCat[cat].kg += a.peso_neto_kg || a.peso_total_kg || 0;
      compradosPorCat[cat].valor += a.subtotal || 0;
    });
  });

  const vendidosPorCat = {};
  ventas.forEach(v => {
    (v.animales || []).forEach(a => {
      const cat = a.categoria || 'mixto';
      if (!vendidosPorCat[cat]) vendidosPorCat[cat] = { cantidad: 0, kg: 0, valor: 0 };
      vendidosPorCat[cat].cantidad += a.cantidad || 0;
      vendidosPorCat[cat].kg += a.peso_total_kg || 0;
      vendidosPorCat[cat].valor += a.subtotal || 0;
    });
  });

  const mortPorCat = {};
  mortandades.forEach(m => {
    const cat = m.categoria || 'mixto';
    if (!mortPorCat[cat]) mortPorCat[cat] = 0;
    mortPorCat[cat] += m.cantidad || 0;
  });

  const allCats = new Set([...Object.keys(compradosPorCat), ...Object.keys(vendidosPorCat), ...Object.keys(mortPorCat)]);
  const stockPorCat = Array.from(allCats).map(cat => ({
    cat,
    label: SUBCATEGORIAS.find(s => s.value === cat)?.label || (cat === 'mixto' ? 'Mixto' : cat),
    comprados: compradosPorCat[cat]?.cantidad || 0,
    vendidos: vendidosPorCat[cat]?.cantidad || 0,
    muertos: mortPorCat[cat] || 0,
    stock: (compradosPorCat[cat]?.cantidad || 0) - (vendidosPorCat[cat]?.cantidad || 0) - (mortPorCat[cat] || 0),
  }));

  // Mixto: comprado total
  const mixtoComprado = compradosPorCat['mixto']?.cantidad || 0;
  // Mixto: vendido total (ya registrado como mixto en ventas)
  const mixtoVendido = vendidosPorCat['mixto']?.cantidad || 0;
  // Desglose manual de ventas: cuántos mixtos se discriminan como cada categoría al vender
  const totalDesgloseManual = Object.values(desgloseMixto).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const mixtoSinDesig = mixtoComprado - totalDesgloseManual;

  const totalComprado = compras.reduce((s, c) => s + (c.total_compra || 0), 0);
  const totalVendido = ventas.reduce((s, v) => s + (v.total_venta || 0), 0);
  const gananciaTotal = totalVendido - totalComprado;
  const stockTotal = stockPorCat.reduce((s, c) => s + c.stock, 0);
  const totalMuertos = mortandades.reduce((s, m) => s + (m.cantidad || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Stock y Rentabilidad</h1>
          <p className="text-slate-500 mt-1">Control de inventario y análisis de ganancias</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Stock Actual" value={stockTotal} subtitle="cabezas" icon={Package} color="blue" delay={0} />
          <StatsCard title="Total Comprado" value={`$${totalComprado.toLocaleString('es-AR')}`} icon={TrendingDown} color="rose" delay={0.1} />
          <StatsCard title="Total Vendido" value={`$${totalVendido.toLocaleString('es-AR')}`} icon={TrendingUp} color="emerald" delay={0.2} />
          <StatsCard title="Mortandad" value={totalMuertos} subtitle="cabezas" icon={Skull} color="violet" delay={0.3} />
        </div>

        {/* Rentabilidad rápida */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`rounded-2xl p-5 border mb-6 flex items-center justify-between ${gananciaTotal >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div>
            <p className={`text-sm font-medium ${gananciaTotal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{gananciaTotal >= 0 ? 'Ganancia acumulada' : 'Pérdida acumulada'}</p>
            <p className={`text-3xl font-bold mt-1 ${gananciaTotal >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>${Math.abs(gananciaTotal).toLocaleString('es-AR')}</p>
          </div>
          <div className="text-right space-y-1 text-sm">
            <div className="text-rose-600 font-semibold">Compras: ${totalComprado.toLocaleString('es-AR')}</div>
            <div className="text-emerald-600 font-semibold">Ventas: ${totalVendido.toLocaleString('es-AR')}</div>
          </div>
        </motion.div>

        {/* Stock por categoría - COMPRAS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
              <TrendingDown className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Compras por Categoría</h2>
              <p className="text-xs text-slate-400">Animales ingresados — los "Mixto" aparecen sin discriminar</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium text-center">Cabezas</th>
                  <th className="px-5 py-3 font-medium text-center">Kg Netos</th>
                  <th className="px-5 py-3 font-medium text-center">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(compradosPorCat).map(([cat, data], idx) => (
                  <tr key={cat} className={`border-b border-slate-50 hover:bg-slate-50 ${cat === 'mixto' ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-5 py-3 font-medium text-slate-700 capitalize flex items-center gap-2">
                      {cat === 'mixto' && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">Mixto</span>}
                      {SUBCATEGORIAS.find(s => s.value === cat)?.label || (cat === 'mixto' ? '' : cat)}
                    </td>
                    <td className="px-5 py-3 text-center font-semibold text-rose-600">{data.cantidad}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{data.kg.toLocaleString('es-AR')} kg</td>
                    <td className="px-5 py-3 text-center text-slate-600">${data.valor.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-rose-700 text-white text-xs">
                  <td className="px-5 py-3 font-semibold">Total</td>
                  <td className="px-5 py-3 text-center font-semibold">{Object.values(compradosPorCat).reduce((s, d) => s + d.cantidad, 0)}</td>
                  <td className="px-5 py-3 text-center">{Object.values(compradosPorCat).reduce((s, d) => s + d.kg, 0).toLocaleString('es-AR')} kg</td>
                  <td className="px-5 py-3 text-center">${Object.values(compradosPorCat).reduce((s, d) => s + d.valor, 0).toLocaleString('es-AR')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>

        {/* Stock por categoría - VENTAS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Ventas por Categoría</h2>
                <p className="text-xs text-slate-400">Discriminá manualmente los animales vendidos como Mixto</p>
              </div>
            </div>
            {mixtoComprado > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowDesglose(!showDesglose)} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs">
                <SplitSquareHorizontal className="h-4 w-4" />{showDesglose ? 'Ocultar' : 'Discriminar Mixto'}
              </Button>
            )}
          </div>

          {showDesglose && (
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <p className="text-sm font-medium text-blue-800 mb-1">
                Total comprado como Mixto: <span className="font-bold">{mixtoComprado} cab.</span>
                {mixtoSinDesig > 0 && <span className="ml-3 text-amber-700">· Sin asignar: <span className="font-bold">{mixtoSinDesig}</span></span>}
                {mixtoSinDesig < 0 && <span className="ml-3 text-red-700 font-bold">· ⚠ Excede el total</span>}
              </p>
              <p className="text-xs text-blue-500 mb-3">Ingresá cuántos de los Mixtos comprados corresponden a cada categoría (solo visual).</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {SUBCATEGORIAS.map(sub => (
                  <div key={sub.value}>
                    <Label className="text-xs text-blue-700">{sub.label}</Label>
                    <Input
                      type="number"
                      min="0"
                      max={mixtoComprado}
                      value={desgloseMixto[sub.value] || ''}
                      onChange={(e) => setDesgloseMixto({ ...desgloseMixto, [sub.value]: parseInt(e.target.value) || 0 })}
                      className="mt-1 bg-white text-center h-8"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium text-center">Vendidos</th>
                  {showDesglose && <th className="px-5 py-3 font-medium text-center text-blue-600">+ Discriminado</th>}
                  <th className="px-5 py-3 font-medium text-center">Kg</th>
                  <th className="px-5 py-3 font-medium text-center">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(vendidosPorCat).length === 0 && !showDesglose ? (
                  <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">Sin ventas registradas</td></tr>
                ) : (
                  <>
                    {Object.entries(vendidosPorCat).map(([cat, data]) => (
                      <tr key={cat} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-700 capitalize">
                          {SUBCATEGORIAS.find(s => s.value === cat)?.label || (cat === 'mixto' ? 'Mixto' : cat)}
                        </td>
                        <td className="px-5 py-3 text-center font-semibold text-emerald-600">{data.cantidad}</td>
                        {showDesglose && <td className="px-5 py-3 text-center text-blue-500">
                          {cat !== 'mixto' && desgloseMixto[cat] ? `+${desgloseMixto[cat]}` : '—'}
                        </td>}
                        <td className="px-5 py-3 text-center text-slate-600">{data.kg.toLocaleString('es-AR')} kg</td>
                        <td className="px-5 py-3 text-center text-slate-600">${data.valor.toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                    {showDesglose && SUBCATEGORIAS.filter(s => !vendidosPorCat[s.value] && desgloseMixto[s.value] > 0).map(s => (
                      <tr key={`disc-${s.value}`} className="border-b border-slate-50 bg-blue-50/30">
                        <td className="px-5 py-3 font-medium text-slate-700">{s.label}</td>
                        <td className="px-5 py-3 text-center text-slate-300">—</td>
                        <td className="px-5 py-3 text-center text-blue-600 font-semibold">+{desgloseMixto[s.value]}</td>
                        <td className="px-5 py-3 text-center text-slate-300">—</td>
                        <td className="px-5 py-3 text-center text-slate-300">—</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-700 text-white text-xs">
                  <td className="px-5 py-3 font-semibold">Total</td>
                  <td className="px-5 py-3 text-center font-semibold">{Object.values(vendidosPorCat).reduce((s, d) => s + d.cantidad, 0)}</td>
                  {showDesglose && <td className="px-5 py-3 text-center font-semibold text-blue-200">{totalDesgloseManual} asig.</td>}
                  <td className="px-5 py-3 text-center">{Object.values(vendidosPorCat).reduce((s, d) => s + d.kg, 0).toLocaleString('es-AR')} kg</td>
                  <td className="px-5 py-3 text-center">${Object.values(vendidosPorCat).reduce((s, d) => s + d.valor, 0).toLocaleString('es-AR')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>

        {/* Mortandad */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Skull className="h-5 w-5 text-violet-600" />Mortandad</h2>
            <Button variant="outline" size="sm" onClick={() => setShowMortForm(!showMortForm)} className="border-violet-200 text-violet-700 hover:bg-violet-50 gap-2">
              <Plus className="h-4 w-4" />Registrar
            </Button>
          </div>

          {showMortForm && (
            <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-slate-500">Fecha</Label>
                  <Input type="date" value={mortForm.fecha} onChange={(e) => setMortForm({ ...mortForm, fecha: e.target.value })} className="mt-1 bg-white" />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Categoría</Label>
                  <Select value={mortForm.categoria} onValueChange={(v) => setMortForm({ ...mortForm, categoria: v })}>
                    <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUBCATEGORIAS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      <SelectItem value="mixto">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Cantidad</Label>
                  <Input type="number" min="1" value={mortForm.cantidad} onChange={(e) => setMortForm({ ...mortForm, cantidad: parseInt(e.target.value) || 1 })} className="mt-1 bg-white" />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Descripción</Label>
                  <Input value={mortForm.descripcion} onChange={(e) => setMortForm({ ...mortForm, descripcion: e.target.value })} placeholder="Causa..." className="mt-1 bg-white" />
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowMortForm(false)}>Cancelar</Button>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => createMort.mutate(mortForm)}>Guardar</Button>
              </div>
            </div>
          )}

          {mortandades.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No hay registros de mortandad</p>
          ) : (
            <div className="space-y-2">
              {mortandades.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                  <div>
                    <span className="font-medium text-slate-700 capitalize">{m.categoria}</span>
                    <span className="text-slate-400 text-sm ml-3">{m.fecha}</span>
                    {m.descripcion && <span className="text-slate-400 text-xs ml-2">— {m.descripcion}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-violet-700">{m.cantidad} cab.</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => deleteMort.mutate(m.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rentabilidad */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`rounded-2xl p-6 border ${gananciaTotal >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${gananciaTotal >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>{gananciaTotal >= 0 ? 'Ganancia Neta' : 'Pérdida Neta'}</h3>
              <p className={`text-sm ${gananciaTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Diferencia entre ventas y compras totales</p>
            </div>
            <div className={`text-3xl font-bold ${gananciaTotal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>${Math.abs(gananciaTotal).toLocaleString('es-AR')}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}