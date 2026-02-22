import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Eye, Trash2, ArrowUpRight, Scale, Search, Edit2 } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function Ventas() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ['ventas'],
    queryFn: () => base44.entities.Venta.list('-fecha', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Venta.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['ventas']);
      setDeleteId(null);
    }
  });

  const filteredVentas = ventas.filter(v => 
    v.comprador?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Ventas</h1>
            <p className="text-slate-500 mt-1">Historial de ventas</p>
          </div>
          <Link to={createPageUrl('NuevaVenta')}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Plus className="h-4 w-4" />
              Nueva Venta
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por comprador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredVentas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center border border-slate-100"
          >
            <ArrowUpRight className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay ventas registradas</p>
            <Link to={createPageUrl('NuevaVenta')}>
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                Registrar primera venta
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredVentas.map((venta, index) => (
                <motion.div
                  key={venta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{venta.comprador}</h3>
                          <p className="text-sm text-slate-400">
                            {format(new Date(venta.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          {venta.cantidad_total_animales || 0} cabezas
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 gap-1">
                          <Scale className="h-3 w-3" />
                          {(venta.peso_total || 0).toLocaleString('es-AR')} kg
                        </Badge>
                        {venta.medio_pago && (
                          <Badge variant="outline" className="capitalize">
                            {venta.medio_pago}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Total</p>
                        <p className="text-xl font-bold text-emerald-600">
                          ${(venta.total_venta || 0).toLocaleString('es-AR')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link to={createPageUrl('DetalleVenta') + `?id=${venta.id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={createPageUrl('EditarVenta') + `?id=${venta.id}`}>
                          <Button variant="outline" size="icon" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setDeleteId(venta.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            <AlertDialogTitle>¿Eliminar esta venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}