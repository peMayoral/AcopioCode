import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from 'lucide-react';
import NumericInput from '../ui/NumericInput';

const CATEGORIAS = [
  { value: 'novillo', label: 'Novillo' },
  { value: 'toro', label: 'Toro' },
  { value: 'ternero', label: 'Ternero' },
  { value: 'ternera', label: 'Ternera' },
  { value: 'vaca', label: 'Vaca' },
  { value: 'vaquillona', label: 'Vaquillona' },
  { value: 'mixto', label: 'Mixto' },
];

export default function AnimalForm({ animales, setAnimales }) {
  const addAnimal = () => {
    setAnimales([...animales, {
      categoria: '', cantidad: 1, peso_bruto_kg: 0, desbaste_porcentaje: 3,
      peso_neto_kg: 0, precio_por_kg: 0, subtotal: 0, aplica_iva: false, iva_monto: 0
    }]);
  };

  const removeAnimal = (index) => setAnimales(animales.filter((_, i) => i !== index));

  const updateAnimal = (index, field, value) => {
    const updated = [...animales];
    updated[index] = { ...updated[index], [field]: value };

    const a = updated[index];
    if (['peso_bruto_kg', 'desbaste_porcentaje', 'precio_por_kg', 'cantidad', 'aplica_iva'].includes(field)) {
      const pesoBruto = field === 'peso_bruto_kg' ? value : a.peso_bruto_kg;
      const desbaste = field === 'desbaste_porcentaje' ? value : a.desbaste_porcentaje;
      const precioPorKg = field === 'precio_por_kg' ? value : a.precio_por_kg;
      const aplica = field === 'aplica_iva' ? value : a.aplica_iva;

      const pesoNeto = pesoBruto * (1 - desbaste / 100);
      const base = Math.round(pesoNeto * precioPorKg * 100) / 100;
      const iva = aplica ? Math.round(base * 0.105 * 100) / 100 : 0;

      updated[index].peso_neto_kg = Math.round(pesoNeto * 100) / 100;
      // subtotal SIN IVA — el IVA se suma aparte en el resumen
      updated[index].subtotal = base;
      updated[index].iva_monto = iva;
    }

    setAnimales(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Animales</h3>
        <Button type="button" onClick={addAnimal} variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          <Plus className="h-4 w-4" />Agregar
        </Button>
      </div>

      {animales.map((animal, index) => (
        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Animal #{index + 1}</span>
            {animales.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeAnimal(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="col-span-2 md:col-span-1">
              <Label className="text-xs text-slate-500">Categoría</Label>
              <Select value={animal.categoria} onValueChange={(v) => updateAnimal(index, 'categoria', v)}>
                <SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-slate-500">Cantidad</Label>
              <NumericInput value={animal.cantidad} onChange={(v) => updateAnimal(index, 'cantidad', parseInt(v) || 1)} className="mt-1 bg-white" />
            </div>

            <div>
              <Label className="text-xs text-slate-500">Peso Bruto (kg)</Label>
              <NumericInput value={animal.peso_bruto_kg} onChange={(v) => updateAnimal(index, 'peso_bruto_kg', v)} className="mt-1 bg-white" />
            </div>

            <div>
              <Label className="text-xs text-slate-500">Desbaste (%)</Label>
              <NumericInput value={animal.desbaste_porcentaje} onChange={(v) => updateAnimal(index, 'desbaste_porcentaje', v)} className="mt-1 bg-white" />
            </div>

            <div>
              <Label className="text-xs text-slate-500">$/kg</Label>
              <NumericInput value={animal.precio_por_kg} onChange={(v) => updateAnimal(index, 'precio_por_kg', v)} className="mt-1 bg-white" />
            </div>

            <div>
              <Label className="text-xs text-slate-500">Subtotal</Label>
              <div className="mt-1 px-3 py-2 bg-emerald-50 rounded-md border border-emerald-100 text-emerald-700 font-semibold text-sm">
                ${animal.subtotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-400">Peso neto: {animal.peso_neto_kg.toLocaleString('es-AR')} kg</span>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`iva-${index}`}
                checked={animal.aplica_iva || false}
                onCheckedChange={(v) => updateAnimal(index, 'aplica_iva', v)}
              />
              <Label htmlFor={`iva-${index}`} className="text-xs cursor-pointer text-slate-500">
                IVA 10.5%
              </Label>
            </div>
          </div>
          {animal.aplica_iva && animal.iva_monto > 0 && (
            <div className="flex justify-between text-xs px-2 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-amber-700">Subtotal sin IVA: ${animal.subtotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
              <span className="text-amber-700">+ IVA: ${animal.iva_monto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
              <span className="font-bold text-amber-800">= ${(animal.subtotal + animal.iva_monto).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}