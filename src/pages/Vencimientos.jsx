import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format, differenceInDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, AlertTriangle, CheckCircle2, Clock, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function getEstado(plazo) {
  if (plazo.pagado) return 'pagado';
  if (!plazo.fecha_vencimiento) return 'sin_fecha';
  const hoy = new Date();
  const venc = parseISO(plazo.fecha_vencimiento);
  const dias = differenceInDays(venc, hoy);
  if (dias < 0) return 'vencido';
  if (dias <= 7) return 'proximo';
  return 'pendiente';
}

const estadoConfig = {
  vencido:   { label: 'Vencido',   color: 'bg-red-100 text-red-700 border-red-200',       icon: AlertTriangle, bg: 'border-l-red-500' },
  proximo:   { label: 'Próximo',   color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock,         bg: 'border-l-amber-400' },
  pendiente: { label: 'Pendiente', color: 'bg-blue-100 text-blue-700 border-blue-200',    icon: CalendarClock, bg: 'border-l-blue-400' },
  pagado:    { label: 'Pagado',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, bg: 'border-l-emerald-400' },
  sin_fecha: { label: 'Sin fecha', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: CalendarClock, bg: 'border-l-slate-300' },
};

function MiniCalendar({ plazos, mes, onChangeMes }) {
  const start = startOfMonth(mes);
  const end = endOfMonth(mes);
  const days = eachDayOfInterval({ start, end });
  const startDow = start.getDay(); // 0=dom

  const getPlazosDelDia = (day) =>
    plazos.filter(p => p.fecha_vencimiento && isSameDay(parseISO(p.fecha_vencimiento), day));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => onChangeMes(subMonths(mes, 1))} className="p-1 rounded hover:bg-slate-100">
          <ChevronLeft className="h-4 w-4 text-slate-500" />
        </button>
        <span className="font-semibold text-slate-700 capitalize">
          {format(mes, 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={() => onChangeMes(addMonths(mes, 1))} className="p-1 rounded hover:bg-slate-100">
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-1">
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array(startDow).fill(null).map((_, i) => <div key={`e-${i}`} />)}
        {days.map(day => {
          const ps = getPlazosDelDia(day);
          const hasCobro = ps.some(p => p.tipo === 'venta');
          const hasPago = ps.some(p => p.tipo === 'compra');
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className={`relative flex flex-col items-center justify-center rounded-lg p-1 min-h-[36px] text-xs
              ${isToday ? 'bg-slate-800 text-white font-bold' : 'text-slate-700'}
              ${ps.length > 0 ? 'cursor-pointer' : ''}
            `}>
              <span>{format(day, 'd')}</span>
              {ps.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasCobro && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Cobro" />}
                  {hasPago && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Pago" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Cobro</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" />Pago</span>
      </div>
    </div>
  );
}

export default function Vencimientos() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('todos');        // todos | compras | ventas
  const [filtroVentas, setFiltroVentas] = useState('todos'); // todos | pendientes | por_cobrar
  const [filtroCompras, setFiltroCompras] = useState('todos');
  const [mesCal, setMesCal] = useState(new Date());
  const [showCal, setShowCal] = useState(false);

  const { data: compras = [] } = useQuery({
    queryKey: ['compras'],
    queryFn: () => base44.entities.Compra.list('-fecha', 500),
  });
  const { data: ventas = [] } = useQuery({
    queryKey: ['ventas'],
    queryFn: () => base44.entities.Venta.list('-fecha', 500),
  });

  const updateCompraMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Compra.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['compras']),
  });
  const updateVentaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Venta.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['ventas']),
  });

  const marcarPagado = (tipo, registro, plazoIndex) => {
    const nuevoPlazos = [...(registro.plazos_pago || [])];
    nuevoPlazos[plazoIndex] = {
      ...nuevoPlazos[plazoIndex],
      pagado: !nuevoPlazos[plazoIndex].pagado,
      fecha_pago: !nuevoPlazos[plazoIndex].pagado ? new Date().toISOString().split('T')[0] : '',
    };
    if (tipo === 'compra') updateCompraMutation.mutate({ id: registro.id, data: { plazos_pago: nuevoPlazos } });
    else updateVentaMutation.mutate({ id: registro.id, data: { plazos_pago: nuevoPlazos } });
  };

  const todosPlazos = [
    ...compras.flatMap((c) =>
      (c.plazos_pago || []).map((p, i) => ({
        ...p, tipo: 'compra', registro: c, plazoIndex: i,
        contraparte: c.proveedor_nombre, estado: getEstado(p),
      }))
    ),
    ...ventas.flatMap((v) =>
      (v.plazos_pago || []).map((p, i) => ({
        ...p, tipo: 'venta', registro: v, plazoIndex: i,
        contraparte: v.comprador, estado: getEstado(p),
      }))
    ),
  ].sort((a, b) => {
    if (!a.fecha_vencimiento) return 1;
    if (!b.fecha_vencimiento) return -1;
    return parseISO(a.fecha_vencimiento) - parseISO(b.fecha_vencimiento);
  });

  const plazosVenta = todosPlazos.filter(p => p.tipo === 'venta');
  const plazosCompra = todosPlazos.filter(p => p.tipo === 'compra');

  // Filtros por tab
  const filtrarVentas = (lista) => {
    if (filtroVentas === 'pendientes') return lista.filter(p => p.estado !== 'pagado');
    if (filtroVentas === 'por_cobrar') return lista.filter(p => !p.pagado); // igual a pendientes pero con otro label
    return lista;
  };
  const filtrarCompras = (lista) => {
    if (filtroCompras === 'pendientes') return lista.filter(p => p.estado !== 'pagado');
    if (filtroCompras === 'pagados') return lista.filter(p => p.estado === 'pagado');
    return lista;
  };

  let plazosVisibles = [];
  if (tab === 'todos') plazosVisibles = todosPlazos;
  else if (tab === 'ventas') plazosVisibles = filtrarVentas(plazosVenta);
  else if (tab === 'compras') plazosVisibles = filtrarCompras(plazosCompra);

  const totalPorCobrar = plazosVenta.filter(p => !p.pagado).reduce((s, p) => s + (p.monto || 0), 0);
  const totalPorPagar = plazosCompra.filter(p => !p.pagado).reduce((s, p) => s + (p.monto || 0), 0);
  const contVencidos = todosPlazos.filter(p => p.estado === 'vencido').length;
  const contProximos = todosPlazos.filter(p => p.estado === 'proximo').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Plazos</h1>
            <p className="text-slate-500 mt-1">Plazos de pagos y cobros</p>
          </div>
          <Button variant="outline" onClick={() => setShowCal(!showCal)} className="gap-2">
            <Calendar className="h-4 w-4" />
            {showCal ? 'Ocultar calendario' : 'Ver calendario'}
          </Button>
        </motion.div>

        {/* Resumen */}
        {(() => {
          const balance = totalPorCobrar - totalPorPagar;
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                className="rounded-2xl p-5 border bg-amber-50 border-amber-200 text-amber-700">
                <p className="text-sm font-medium opacity-75">Próximos (7d)</p>
                <p className="text-2xl font-bold mt-1">{contProximos}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="rounded-2xl p-5 border bg-emerald-50 border-emerald-200 text-emerald-700">
                <p className="text-sm font-medium opacity-75">Por cobrar</p>
                <p className="text-2xl font-bold mt-1">${totalPorCobrar.toLocaleString('es-AR')}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="rounded-2xl p-5 border bg-rose-50 border-rose-200 text-rose-700">
                <p className="text-sm font-medium opacity-75">Por pagar</p>
                <p className="text-2xl font-bold mt-1">${totalPorPagar.toLocaleString('es-AR')}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                className={`rounded-2xl p-5 border ${balance >= 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                <p className="text-sm font-medium opacity-75">Balance neto</p>
                <p className="text-2xl font-bold mt-1">{balance >= 0 ? '+' : ''}${balance.toLocaleString('es-AR')}</p>
                <p className="text-xs opacity-60 mt-0.5">{balance >= 0 ? 'A favor' : 'En contra'}</p>
              </motion.div>
            </div>
          );
        })()}

        <div className={`grid gap-6 mb-6 ${showCal ? 'md:grid-cols-3' : ''}`}>
          {showCal && (
            <div className="md:col-span-1">
              <MiniCalendar plazos={todosPlazos} mes={mesCal} onChangeMes={setMesCal} />
            </div>
          )}

          <div className={showCal ? 'md:col-span-2' : ''}>
            {/* Tabs principales */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'compras', label: '🐄 Plazos de Compra' },
                { key: 'ventas', label: '💰 Plazos de Venta' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === t.key ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sub-filtros para Ventas */}
            {tab === 'ventas' && (
              <div className="flex gap-2 mb-4">
                {[
                  { key: 'todos', label: 'Todos' },
                  { key: 'pendientes', label: 'Pendientes' },
                  { key: 'por_cobrar', label: 'Por cobrar' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFiltroVentas(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filtroVentas === f.key ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Sub-filtros para Compras */}
            {tab === 'compras' && (
              <div className="flex gap-2 mb-4">
                {[
                  { key: 'todos', label: 'Todos' },
                  { key: 'pendientes', label: 'Pendientes' },
                  { key: 'pagados', label: 'Pagados' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFiltroCompras(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filtroCompras === f.key ? 'bg-rose-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Lista */}
            {plazosVisibles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <CalendarClock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay vencimientos en esta categoría</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plazosVisibles.map((plazo, idx) => {
                  const cfg = estadoConfig[plazo.estado];
                  const Icon = cfg.icon;
                  const diasRestantes = plazo.fecha_vencimiento
                    ? differenceInDays(parseISO(plazo.fecha_vencimiento), new Date())
                    : null;

                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                      className={`bg-white rounded-2xl border border-l-4 ${cfg.bg} p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg border ${cfg.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800">{plazo.descripcion || 'Cuota'}</span>
                            <Badge variant="outline" className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                            <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                              plazo.tipo === 'compra' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {plazo.tipo === 'compra'
                                ? <><ArrowDownLeft className="h-3 w-3" />Por pagar</>
                                : <><ArrowUpRight className="h-3 w-3" />Por cobrar</>}
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{plazo.contraparte}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                            {plazo.fecha_vencimiento && (
                              <span>Vence: {format(parseISO(plazo.fecha_vencimiento), "d MMM yyyy", { locale: es })}</span>
                            )}
                            {diasRestantes !== null && !plazo.pagado && (
                              <span className={diasRestantes < 0 ? 'text-red-500 font-medium' : diasRestantes <= 7 ? 'text-amber-500 font-medium' : ''}>
                                {diasRestantes < 0
                                  ? `Vencido hace ${Math.abs(diasRestantes)} días`
                                  : diasRestantes === 0 ? 'Vence hoy'
                                  : `En ${diasRestantes} días`}
                              </span>
                            )}
                            {plazo.pagado && plazo.fecha_pago && (
                              <span>Pagado: {format(parseISO(plazo.fecha_pago), "d MMM yyyy", { locale: es })}</span>
                            )}
                            {plazo.medio_pago && <span className="capitalize">· {plazo.medio_pago}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xl font-bold text-slate-800">${(plazo.monto || 0).toLocaleString('es-AR')}</span>
                        <Button
                          variant={plazo.pagado ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => marcarPagado(plazo.tipo, plazo.registro, plazo.plazoIndex)}
                          className={plazo.pagado
                            ? 'text-slate-500 border-slate-200'
                            : plazo.tipo === 'compra'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                        >
                          {plazo.pagado
                            ? 'Desmarcar'
                            : plazo.tipo === 'compra' ? '✓ Pagado' : '✓ Cobrado'}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}