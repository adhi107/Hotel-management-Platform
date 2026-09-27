import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Plus, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  X, 
  Edit3, 
  Trash2, 
  Search, 
  Sparkles, 
  Layers, 
  UtensilsCrossed, 
  Check, 
  AlertCircle,
  Square,
  Circle,
  RectangleHorizontal,
  ChevronRight,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import { TableItem } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { ActiveTab } from '../../components/Sidebar';
import { Pagination } from '../../components/Pagination';

interface FloorPlanViewProps {
  onNavigate?: (tab: ActiveTab) => void;
}

const SECTIONS = [
  'All Sections',
  'Main Dining',
  'AC Family Hall',
  'Outdoor Patio',
  'Rooftop Terrace',
  'VIP Private Lounge',
  'Bar Counter'
];

export const FloorPlanView: React.FC<FloorPlanViewProps> = ({ onNavigate }) => {
  const { tenant } = useAuthStore();
  const [tables, setTables] = useState<TableItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [searchQuery, setSearchQuery] = useState('');
  const [floorPage, setFloorPage] = useState(1);
  const [floorPageSize, setFloorPageSize] = useState(12);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<TableItem | null>(null);

  // Form State for Add / Edit
  const [formTableNumber, setFormTableNumber] = useState('');
  const [formCapacity, setFormCapacity] = useState<number>(4);
  const [formShape, setFormShape] = useState<'square' | 'round' | 'rectangle'>('square');
  const [formSection, setFormSection] = useState('Main Dining');
  const [formStatus, setFormStatus] = useState<'available' | 'occupied' | 'billing' | 'reserved' | 'cleaning'>('available');
  const [isSaving, setIsSaving] = useState(false);

  const fetchFloorPlan = async () => {
    try {
      const res = await api.get('/tables/floor-plan');
      setTables(res.data.data?.tables || []);
    } catch (err) {
      console.error('Failed to load floor plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorPlan();
  }, []);

  const openAddModal = () => {
    const count = tables.length + 1;
    const nextNum = count < 10 ? `T-0${count}` : `T-${count}`;
    setFormTableNumber(nextNum);
    setFormCapacity(4);
    setFormShape('square');
    setFormSection('Main Dining');
    setFormStatus('available');
    setIsAddModalOpen(true);
  };

  const openEditModal = (tbl: TableItem) => {
    setTableToEdit(tbl);
    setFormTableNumber(tbl.table_number);
    setFormCapacity(tbl.capacity || 4);
    setFormShape(tbl.shape || 'square');
    setFormSection(tbl.section_name || 'Main Dining');
    setFormStatus(tbl.status || 'available');
    setIsEditModalOpen(true);
  };

  const handleSaveAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTableNumber.trim()) return;
    setIsSaving(true);
    try {
      await api.post('/tables', {
        table_number: formTableNumber.trim(),
        capacity: Number(formCapacity),
        shape: formShape,
        section_name: formSection,
        section_id: `sec-${formSection.toLowerCase().replace(/\s+/g, '-')}`,
        status: formStatus
      });
      setIsAddModalOpen(false);
      fetchFloorPlan();
      alert(`Table ${formTableNumber} created successfully!`);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create table');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEditTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableToEdit || !formTableNumber.trim()) return;
    setIsSaving(true);
    try {
      await api.put(`/tables/${tableToEdit.id}`, {
        table_number: formTableNumber.trim(),
        capacity: Number(formCapacity),
        shape: formShape,
        section_name: formSection,
        section_id: `sec-${formSection.toLowerCase().replace(/\s+/g, '-')}`,
        status: formStatus
      });
      setIsEditModalOpen(false);
      fetchFloorPlan();
      if (selectedTable?.id === tableToEdit.id) {
        setSelectedTable({
          ...selectedTable,
          table_number: formTableNumber.trim(),
          capacity: Number(formCapacity),
          shape: formShape,
          section_name: formSection,
          status: formStatus
        });
      }
      alert(`Table ${formTableNumber} updated successfully!`);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update table');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async (tableId: string, tableNum: string) => {
    if (!confirm(`Are you sure you want to delete Table ${tableNum}?`)) return;
    try {
      await api.delete(`/tables/${tableId}`);
      if (selectedTable?.id === tableId) setSelectedTable(null);
      if (tableToEdit?.id === tableId) setIsEditModalOpen(false);
      fetchFloorPlan();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete table');
    }
  };

  const handleUpdateStatus = async (tableId: string, newStatus: string) => {
    try {
      await api.patch(`/tables/${tableId}/status?status=${newStatus}`);
      fetchFloorPlan();
      if (selectedTable?.id === tableId) {
        setSelectedTable(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const filteredTables = tables.filter(tbl => {
    const matchesSection = selectedSection === 'All Sections' || (tbl.section_name || 'Main Dining') === selectedSection;
    const matchesSearch = tbl.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tbl.section_name && tbl.section_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSection && matchesSearch;
  });

  const paginatedTables = filteredTables.slice((floorPage - 1) * floorPageSize, floorPage * floorPageSize);

  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const billingCount = tables.filter(t => t.status === 'billing').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const cleaningCount = tables.filter(t => t.status === 'cleaning').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300';
      case 'billing':
        return 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-300';
      case 'reserved':
        return 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-300';
      case 'cleaning':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-300';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto h-full flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 pb-1 border-b border-aura-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-sm">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-aura-text tracking-tight flex items-center gap-2">
                <span>Floor Plan & Table Management</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-aura-text font-bold border border-aura-border">
                  {tables.length} Tables
                </span>
              </h1>
              <p className="text-xs text-aura-muted mt-0.5">
                Real-time dining table layout, seating allocation, quick editing and status telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button & Live Status Legend */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openAddModal}
            className="btn-primary px-4 py-2 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Table</span>
          </button>
        </div>
      </div>

      {/* KPI Counters & Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0">
        <div 
          onClick={() => setSelectedSection('All Sections')}
          className="glass-card p-2.5 rounded-xl border border-aura-border flex items-center justify-between cursor-pointer hover:border-zinc-400"
        >
          <span className="flex items-center gap-1.5 text-xs font-bold text-aura-text">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Available
          </span>
          <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">{availableCount}</span>
        </div>

        <div className="glass-card p-2.5 rounded-xl border border-aura-border flex items-center justify-between cursor-pointer hover:border-zinc-400">
          <span className="flex items-center gap-1.5 text-xs font-bold text-aura-text">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Occupied
          </span>
          <span className="text-sm font-mono font-black text-amber-600 dark:text-amber-400">{occupiedCount}</span>
        </div>

        <div className="glass-card p-2.5 rounded-xl border border-aura-border flex items-center justify-between cursor-pointer hover:border-zinc-400">
          <span className="flex items-center gap-1.5 text-xs font-bold text-aura-text">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Billing
          </span>
          <span className="text-sm font-mono font-black text-blue-600 dark:text-blue-400">{billingCount}</span>
        </div>

        <div className="glass-card p-2.5 rounded-xl border border-aura-border flex items-center justify-between cursor-pointer hover:border-zinc-400">
          <span className="flex items-center gap-1.5 text-xs font-bold text-aura-text">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Reserved
          </span>
          <span className="text-sm font-mono font-black text-purple-600 dark:text-purple-400">{reservedCount}</span>
        </div>

        <div className="glass-card p-2.5 rounded-xl border border-aura-border flex items-center justify-between cursor-pointer hover:border-zinc-400 col-span-2 sm:col-span-1">
          <span className="flex items-center gap-1.5 text-xs font-bold text-aura-text">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Cleaning
          </span>
          <span className="text-sm font-mono font-black text-rose-600 dark:text-rose-400">{cleaningCount}</span>
        </div>
      </div>

      {/* Section Filter Pills and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {SECTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setSelectedSection(sec);
                setFloorPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSection === sec
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'bg-aura-card text-aura-muted hover:text-aura-text border border-aura-border'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-aura-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search table #..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFloorPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-aura-card border border-aura-border text-xs text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-zinc-900 dark:focus:border-white"
          />
        </div>
      </div>

      {/* Visual Canvas & Table Grid */}
      <div className="flex-1 glass-card rounded-2xl p-5 border border-aura-border overflow-y-auto relative flex flex-col justify-between space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paginatedTables.map((tbl) => (
            <div
              key={tbl.id}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between min-h-[160px] transition-all hover:scale-[1.02] shadow-xs relative group ${getStatusColor(
                tbl.status
              )}`}
            >
              {/* Card Top: Capacity & Edit Action */}
              <div className="w-full flex justify-between items-center text-[11px] font-bold">
                <span className="flex items-center gap-1 opacity-90">
                  <Users className="w-3.5 h-3.5" /> {tbl.capacity} Seats
                </span>

                {/* Quick Edit Action Button */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(tbl);
                    }}
                    title="Edit Table"
                    className="p-1 rounded-md bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card Center: Big Table Number */}
              <div 
                onClick={() => setSelectedTable(tbl)}
                className="text-center my-2 cursor-pointer"
              >
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-aura-text block">
                  {tbl.table_number}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-85 block mt-0.5">
                  {tbl.section_name || 'Main Dining'}
                </span>
              </div>

              {/* Card Bottom: Shape & Status Indicator */}
              <div 
                onClick={() => setSelectedTable(tbl)}
                className="w-full pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-black uppercase cursor-pointer"
              >
                <span className="flex items-center gap-1 opacity-80">
                  {tbl.shape === 'round' ? <Circle className="w-2.5 h-2.5" /> : (tbl.shape === 'rectangle' ? <RectangleHorizontal className="w-2.5 h-2.5" /> : <Square className="w-2.5 h-2.5" />)}
                  {tbl.shape || 'Square'}
                </span>
                <span className="capitalize px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-[9px] font-bold">
                  {tbl.status}
                </span>
              </div>
            </div>
          ))}

          {/* "+ Add Table" card directly inside the grid */}
          <button
            onClick={openAddModal}
            className="p-4 rounded-2xl border-2 border-dashed border-aura-border hover:border-zinc-900 dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex flex-col items-center justify-center min-h-[160px] text-aura-muted hover:text-aura-text transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-950 flex items-center justify-center transition-all mb-2 shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold">Add New Table</span>
            <span className="text-[10px] text-aura-muted mt-0.5">Setup seating</span>
          </button>
        </div>

        {filteredTables.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center text-aura-muted">
            <LayoutGrid className="w-10 h-10 mb-2 opacity-40" />
            <h4 className="text-sm font-bold text-aura-text">No Tables in this section</h4>
            <p className="text-xs mt-1">Click "Add New Table" to place tables in {selectedSection}.</p>
          </div>
        )}

        {/* Floor Plan Pagination */}
        {filteredTables.length > 0 && (
          <div className="pt-3 border-t border-aura-border mt-auto">
            <Pagination
              currentPage={floorPage}
              totalItems={filteredTables.length}
              pageSize={floorPageSize}
              onPageChange={setFloorPage}
              onPageSizeChange={(sz) => {
                setFloorPageSize(sz);
                setFloorPage(1);
              }}
              pageSizeOptions={[6, 12, 24, 48]}
            />
          </div>
        )}
      </div>

      {/* Selected Table Action Drawer */}
      {selectedTable && (
        <div className="fixed inset-y-0 right-0 w-84 max-w-full glass-card-elevated border-l border-aura-border p-6 flex flex-col justify-between z-50 shadow-2xl animate-in slide-in-from-right">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-aura-muted">Table Management</span>
                <h3 className="font-extrabold text-xl text-aura-text flex items-center gap-2">
                  <span>Table {selectedTable.table_number}</span>
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTable(null)} 
                className="w-8 h-8 rounded-xl border border-aura-border flex items-center justify-center text-aura-muted hover:text-aura-text hover:bg-aura-dark cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table Details Card */}
            <div className="p-3.5 rounded-xl bg-aura-bg border border-aura-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-aura-muted">Section:</span>
                <span className="font-bold text-aura-text">{selectedTable.section_name || 'Main Dining'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-aura-muted">Seating Capacity:</span>
                <span className="font-bold text-aura-text">{selectedTable.capacity} Persons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-aura-muted">Shape:</span>
                <span className="font-bold text-aura-text capitalize">{selectedTable.shape || 'Square'}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-aura-border">
                <span className="text-aura-muted">Current Status:</span>
                <span className="capitalize font-black text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-aura-text border border-aura-border">
                  {selectedTable.status}
                </span>
              </div>
            </div>

            {/* Quick Status Selector */}
            <div>
              <label className="text-xs font-bold text-aura-text mb-2 block uppercase tracking-wider">
                Quick Change Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'available', label: 'Available', color: 'border-emerald-500 text-emerald-700 dark:text-emerald-400' },
                  { id: 'occupied', label: 'Occupied', color: 'border-amber-500 text-amber-700 dark:text-amber-400' },
                  { id: 'billing', label: 'Billing', color: 'border-blue-500 text-blue-700 dark:text-blue-400' },
                  { id: 'reserved', label: 'Reserved', color: 'border-purple-500 text-purple-700 dark:text-purple-400' },
                  { id: 'cleaning', label: 'Cleaning', color: 'border-rose-500 text-rose-700 dark:text-rose-400' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => handleUpdateStatus(selectedTable.id, st.id)}
                    className={`p-2.5 rounded-xl text-xs font-extrabold uppercase border transition-all cursor-pointer ${
                      selectedTable.status === st.id
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md'
                        : `bg-aura-bg hover:bg-aura-card border-aura-border ${st.color}`
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct POS Order Action */}
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('quick-sale');
                }
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 fill-zinc-950" />
              <span>Punch Order / Quick Sale POS</span>
            </button>
          </div>

          {/* Drawer Bottom Actions */}
          <div className="pt-4 border-t border-aura-border space-y-2">
            <button
              onClick={() => openEditModal(selectedTable)}
              className="w-full py-2.5 rounded-xl bg-aura-card border border-aura-border hover:border-zinc-900 dark:hover:border-white text-xs font-bold text-aura-text flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Table Details</span>
            </button>

            <button
              onClick={() => handleDeleteTable(selectedTable.id, selectedTable.table_number)}
              className="w-full py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Table</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-aura-card rounded-3xl border border-aura-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-aura-text">Add New Dining Table</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-aura-border flex items-center justify-center text-aura-muted hover:text-aura-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddTable} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-aura-text mb-1 block">Table Number / Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-13, B-01, VIP-1"
                  value={formTableNumber}
                  onChange={(e) => setFormTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-sm font-black font-mono text-aura-text focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-aura-text mb-1 block">Seating Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-aura-bg border border-aura-border text-sm font-bold font-mono text-aura-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-aura-text mb-1 block">Table Shape</label>
                  <select
                    value={formShape}
                    onChange={(e) => setFormShape(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-aura-bg border border-aura-border text-xs font-bold text-aura-text focus:outline-none cursor-pointer"
                  >
                    <option value="square">Square Table</option>
                    <option value="round">Round Table</option>
                    <option value="rectangle">Rectangle Table</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-aura-text mb-1 block">Section / Dining Area</label>
                <select
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-aura-bg border border-aura-border text-xs font-bold text-aura-text focus:outline-none cursor-pointer"
                >
                  {SECTIONS.filter(s => s !== 'All Sections').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-aura-text mb-1 block">Initial Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-aura-bg border border-aura-border text-xs font-bold text-aura-text focus:outline-none cursor-pointer"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>

              <div className="pt-3 border-t border-aura-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-aura-border text-xs font-bold text-aura-muted hover:text-aura-text cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary px-5 py-2.5 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Creating...' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {isEditModalOpen && tableToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-aura-card rounded-3xl border border-aura-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-aura-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-aura-text">Edit Table {tableToEdit.table_number}</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-aura-border flex items-center justify-center text-aura-muted hover:text-aura-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTable} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-aura-text mb-1 block">Table Number / Identifier *</label>
                <input
                  type="text"
                  required
                  value={formTableNumber}
                  onChange={(e) => setFormTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aura-bg border border-aura-border text-sm font-black font-mono text-aura-text focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-aura-text mb-1 block">Seating Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-aura-bg border border-aura-border text-sm font-bold font-mono text-aura-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-aura-text mb-1 block">Table Shape</label>
                  <select
                    value={formShape}
                    onChange={(e) => setFormShape(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-aura-bg border border-aura-border text-xs font-bold text-aura-text focus:outline-none cursor-pointer"
                  >
                    <option value="square">Square Table</option>
                    <option value="round">Round Table</option>
                    <option value="rectangle">Rectangle Table</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-aura-text mb-1 block">Section / Dining Area</label>
                <select
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-aura-bg border border-aura-border text-xs font-bold text-aura-text focus:outline-none cursor-pointer"
                >
                  {SECTIONS.filter(s => s !== 'All Sections').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-aura-text mb-1 block">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-aura-bg border border-aura-border text-xs font-bold text-aura-text focus:outline-none cursor-pointer"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="billing">Billing</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>

              <div className="pt-3 border-t border-aura-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteTable(tableToEdit.id, tableToEdit.table_number)}
                  className="text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Table</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-aura-border text-xs font-bold text-aura-muted hover:text-aura-text cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary px-5 py-2.5 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
