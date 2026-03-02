import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthUser } from '../lib/types';
import { getScheduleByDate, openDaySession, upsertDaySchedule } from '../lib/api';

export type AdminTab = 'services' | 'stories' | 'appointments' | 'queue';

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'services', label: 'Service Management' },
  { id: 'appointments', label: 'Appointment Management' },
  { id: 'stories', label: 'Work Management' },
  { id: 'queue', label: 'Queue Management' },
];

export function AdminPage({ user, initialTab = 'services' }: { user: AuthUser; initialTab?: AdminTab }) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const title = useMemo(() => tabs.find((t) => t.id === activeTab)?.label ?? 'Admin', [activeTab]);

  if (user.role !== 'ADMIN') {
    return (
      <div className="px-6 pt-20 pb-32 text-center">
        <h2 className="font-playfair text-2xl text-slate-800 mb-4">Access Restricted</h2>
        <p className="font-inter text-slate-400">Admin privileges are required.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="px-6 pt-12 pb-32">
      <h1 className="font-playfair text-3xl text-center mb-8">Admin Control</h1>

      <div className="grid grid-cols-2 gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3 rounded-lg text-xs tracking-widest uppercase border ${activeTab === tab.id ? 'border-emerald-500 bg-teal-50/20 text-emerald-600' : 'border-teal-100/40 text-slate-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-teal-100/30 p-4 bg-teal-50/10">
        <h2 className="font-playfair text-2xl text-slate-800 mb-4">{title}</h2>
        {activeTab === 'services' && <ServicesPanel />}
        {activeTab === 'stories' && <StoriesPanel />}
        {activeTab === 'appointments' && <AppointmentsPanel />}
        {activeTab === 'queue' && <QueuePanel />}
      </div>
    </motion.div>
  );
}

function ServicesPanel() {
  const [services] = useState([
    { name: 'Precision Haircut', duration: 45, price: 45 },
    { name: 'Hot Towel Shave', duration: 30, price: 35 },
  ]);

  return (
    <div className="space-y-4">
      {services.map((s) => (
        <div key={s.name} className="border border-teal-100/40 rounded-lg p-3 flex justify-between items-center">
          <div>
            <p className="text-slate-800 font-inter">{s.name}</p>
            <p className="text-slate-400 text-sm">{s.duration} mins</p>
          </div>
          <p className="font-playfair text-emerald-500">${s.price}</p>
        </div>
      ))}
    </div>
  );
}

function StoriesPanel() {
  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-sm">Before/After story management is prepared for Firebase Storage integration.</p>
      <button className="w-full py-3 bg-emerald-500 text-white rounded-lg text-xs tracking-widest uppercase font-semibold">Upload Story</button>
    </div>
  );
}

function AppointmentsPanel() {
  const [form, setForm] = useState({
    date: '',
    status: 'OPEN' as 'OPEN' | 'CLOSED',
    startTime: '09:00',
    endTime: '18:00',
    slotDurationMins: 20,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleDateChange = async (date: string) => {
    setForm((prev) => ({ ...prev, date }));
    setMessage('');
    if (!date) return;
    try {
      const existing = await getScheduleByDate(date);
      if (existing) {
        setForm({
          date,
          status: existing.status === 'OPEN' ? 'OPEN' : 'CLOSED',
          startTime: existing.startTime,
          endTime: existing.endTime,
          slotDurationMins: existing.slotDurationMins,
        });
      }
    } catch {
      setMessage('Could not load schedule for selected date');
    }
  };

  const handleSave = async () => {
    if (!form.date) {
      setMessage('Select a day first');
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      await upsertDaySchedule({
        date: form.date,
        status: form.status,
        startTime: form.startTime,
        endTime: form.endTime,
        slotDurationMins: Number(form.slotDurationMins),
      });

      if (form.status === 'OPEN') {
        await openDaySession(form.date);
        setMessage('Day session started. Clients can now book appointments.');
      } else {
        setMessage('Day marked as closed and saved successfully.');
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Failed to save day session');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <input
          className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm"
          type="date"
          value={form.date}
          onChange={(event) => void handleDateChange(event.target.value)}
        />

        <select
          className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm"
          value={form.status}
          onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as 'OPEN' | 'CLOSED' }))}
        >
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm"
            type="time"
            value={form.startTime}
            onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
          />
          <input
            className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm"
            type="time"
            value={form.endTime}
            onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
          />
        </div>

        <input
          className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm"
          type="number"
          min={5}
          max={120}
          value={form.slotDurationMins}
          onChange={(event) => setForm((prev) => ({ ...prev, slotDurationMins: Number(event.target.value) }))}
          placeholder="Minutes per appointment"
        />

        <button
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="w-full py-3 bg-emerald-500 text-white rounded-lg text-xs tracking-widest uppercase font-semibold disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        {message ? <p className="text-emerald-600 text-xs">{message}</p> : null}
      </div>
    </div>
  );
}

function QueuePanel() {
  const [rows] = useState([
    { position: 1, name: 'Alexander R' },
    { position: 2, name: 'Michael T' },
    { position: 3, name: 'James W' },
  ]);

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.position} className="border border-teal-100/40 rounded-lg p-3 flex justify-between items-center">
          <p className="text-emerald-600">#{r.position}</p>
          <p className="text-slate-800">{r.name}</p>
          <button className="text-xs tracking-wide uppercase text-emerald-500">Complete</button>
        </div>
      ))}
    </div>
  );
}
