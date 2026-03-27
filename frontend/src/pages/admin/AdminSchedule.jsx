import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { invalidateSiteContentCache } from '../../hooks/useSiteContent';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const emptyRow = () => ({
  time: '',
  monday: '',
  tuesday: '',
  wednesday: '',
  thursday: '',
  friday: '',
  saturday: '',
});

const AdminSchedule = () => {
  const { getAuthHeaders } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/class-schedule`);
      const data = res.data;
      setRows(Array.isArray(data) && data.length ? data : [emptyRow()]);
    } catch (e) {
      console.error(e);
      setRows([emptyRow()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateCell = (rowIndex, key, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [key]: value };
      return next;
    });
  };

  const addRow = () => setRows((r) => [...r, emptyRow()]);

  const removeRow = (idx) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/class-schedule`, { rows }, getAuthHeaders());
      invalidateSiteContentCache();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#111] font-manrope">Class schedule</h2>
          <p className="text-gray-500 font-dm-sans text-sm">Edit the weekly grid (time + Mon–Sat).</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 border border-gray-200 px-3 py-2 rounded-lg text-sm"
          >
            <Plus size={16} />
            Row
          </button>
          <button
            type="button"
            onClick={saveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save schedule
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-100 rounded-xl">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-primary text-white">
              <th className="text-left p-2 w-28">Time</th>
              {LABELS.map((lb, i) => (
                <th key={DAYS[i]} className="p-2 text-center font-manrope">
                  {lb}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-gray-100">
                <td className="p-1">
                  <input
                    value={row.time || ''}
                    onChange={(e) => updateCell(ri, 'time', e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1"
                    placeholder="8:00 AM"
                  />
                </td>
                {DAYS.map((d) => (
                  <td key={d} className="p-1">
                    <input
                      value={row[d] || ''}
                      onChange={(e) => updateCell(ri, d, e.target.value)}
                      className="w-full border border-gray-200 rounded px-1 py-1 text-center"
                    />
                  </td>
                ))}
                <td className="p-1">
                  <button type="button" onClick={() => removeRow(ri)} className="text-red-500 p-1">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSchedule;
