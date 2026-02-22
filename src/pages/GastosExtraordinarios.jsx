import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import NumericInput from '../components/ui/NumericInput';

export default function GastosExtraordinarios() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], descripcion: '', monto: 0, notas: '' });

  const { data: gastos = [], isLoading } = useQuery({
    queryKey: ['gastos_extraordinarios'],
    queryFn: () => base44.entities.GastoExtraordinario.list('-fecha', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GastoExtraordinario.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['gastos_extraordinarios']); resetForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GastoExtraordinario.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['gastos_extraordinarios']); resetForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GastoExtraordinario.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['gastos_extraordinarios']); setDeleteId(null); }
  });

  const resetForm = () => {
    setForm({ fecha: new Date().toISOString().split('T')[0], descripcion: '', monto: 0, notas: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (gasto) => {
    setForm({ fecha: gasto.fecha, descripcion: gasto.descripcion, monto: gasto.monto, notas: gasto.notas || '' });
    setEditingId(gasto.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const total = gastos.reduce((s, g) => s + (g.monto || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gastos Extraordinarios</h1>
            <p className="text-slate-500 mt-1">Gastos fuera de compras y ventas</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-amber-600 hover:bg-amber-700 gap-2">
            <Plus className="h-4 w-4" /> Nuevo Gasto
          </Button>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-amber-700 font-medium">Total Gastos Extraordinarios</p>
            <p className="text-3xl font-bold text-amber-800">${total.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
          </div>
          <AlertTriangle className="h-10 w-10 text-amber-400" />
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">{editingId ? 'Editar Gasto' : 'Nuevo Gasto Extraordinario'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-600">Fecha</Label>
                    <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="mt-1" required />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-600">Descripción</Label>
                    <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Concepto del gasto" className="mt-1" required />
                  </div>
                  <div>
                    <Label className="text-slate-600">Monto ($)</Label>
                    <NumericInput value={form.monto} onChange={(v) => setForm({ ...form, monto: v })} className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-600">Notas</Label>
                    <Textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Detalles adicionales..." className="mt-1" rows={2} />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    {editingId ? <><Check className="h-4 w-4 mr-2" />Guardar Cambios</> : <><Plus className="h-4 w-4 mr-2" />Agregar Gasto</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-6 animate-pulse"><div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div><div className="h-3 bg-slate-100 rounded w-1/2"></div></div>)}</div>
        ) : gastos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay gastos extraordinarios registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {gastos.map((gasto, idx) => (
                <motion.div key={gasto.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{gasto.descripcion}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{format(new Date(gasto.fecha), "d 'de' MMMM, yyyy", { locale: es })}</p>
                    {gasto.notas && <p className="text-xs text-slate-400 mt-1">{gasto.notas}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-amber-700">${(gasto.monto || 0).toLocaleString('es-AR')}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => startEdit(gasto)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => setDeleteId(gasto.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}