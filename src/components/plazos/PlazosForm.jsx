import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, CalendarClock } from 'lucide-react';
import NumericInput from '../ui/NumericInput';

const MEDIOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'pagare', label: 'Pagaré' },
  { value: 'otro', label: 'Otro' },
];

export default function PlazosForm({ plazos, setPlazos, totalReferencia }) {
  const addPlazo = () => {
    setPlazos([...plazos, {
      descripcion: `Cuota ${plazos.length + 1}`,
      monto: 0, fecha_vencimiento: '', pagado: false, fecha_pago: '', medio_pago: ''
    }]);
  };

  const removePlazo = (index) => setPlazos(plazos.filter((_, i) => i !== index));

  const updatePlazo = (index, field, value) => {
    const updated = [...plazos];
    updated[index] = { ...updated[index], [field]: value };
    setPlazos(updated);
  };

  const totalPlazos = plazos.reduce((sum, p) => sum + (p.monto || 0), 0);
  const diferencia = totalReferencia ? totalReferencia - totalPlazos : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Plazos de Pago</h3>
        </div>
        <Button type="button" onClick={addPlazo} variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
          <Plus className="h-4 w-4" />Agregar Plazo
        </Button>
      </div>

      {plazos.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Sin plazos — el pago es al contado o no tiene cuotas registradas</p>
      ) : (
        <>
          {plazos.map((plazo, index) => (
            <div key={index} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[140px]">
                  <Label className="text-xs text-slate-500">Descripción</Label>
                  <Input value={plazo.descripcion} onChange={(e) => updatePlazo(index, 'descripcion', e.target.value)} placeholder="Ej: Cuota 1, Seña..." className="mt-1 bg-white" />
                </div>
                <div className="w-36">
                  <Label className="text-xs text-slate-500">Monto ($)</Label>
                  <NumericInput value={plazo.monto} onChange={(v) => updatePlazo(index, 'monto', v)} className="mt-1 bg-white" />
                </div>
                <div className="w-44">
                  <Label className="text-xs text-slate-500">Fecha de Vencimiento</Label>
                  <Input type="date" value={plazo.fecha_vencimiento} onChange={(e) => updatePlazo(index, 'fecha_vencimiento', e.target.value)} className="mt-1 bg-white" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removePlazo(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-48">
                <Label className="text-xs text-slate-500">Medio de Pago</Label>
                <Select value={plazo.medio_pago || ''} onValueChange={(v) => updatePlazo(index, 'medio_pago', v)}>
                  <SelectTrigger className="mt-1 bg-white h-8 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{MEDIOS_PAGO.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-6 pt-2 text-sm">
            <span className="text-slate-500">Total plazos: <span className="font-semibold text-slate-700">${totalPlazos.toLocaleString('es-AR')}</span></span>
            {diferencia !== null && (
              <span className={diferencia === 0 ? 'text-emerald-600' : 'text-amber-600'}>
                {diferencia === 0 ? '✓ Coincide con el total' : `Diferencia: $${diferencia.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}