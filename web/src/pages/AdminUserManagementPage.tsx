import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminCreateUser, adminDeleteUser, adminGetUsers, adminUpdateUser, ManagedUser } from '../lib/api'

const emptyForm = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  password: '',
  role: 'CLIENT' as 'ADMIN' | 'CLIENT',
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AdminUserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'CLIENT' as 'ADMIN' | 'CLIENT',
    isActive: true,
  })

  const loadUsers = async () => {
    setIsLoading(true)
    setMessage('')
    try {
      const rows = await adminGetUsers()
      setUsers(rows)
    } catch {
      setMessage('Unable to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const addUser = async () => {
    setMessage('')
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phoneNumber.trim() || !form.password.trim()) {
      setMessage('All user fields are required')
      return
    }

    try {
      const created = await adminCreateUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        role: form.role,
      })
      setUsers((prev) => [created, ...prev])
      setForm(emptyForm)
      setMessage('User created')
    } catch {
      setMessage('Failed to create user')
    }
  }

  const startEditUser = (user: ManagedUser) => {
    setSelectedUserId(user.id)
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
    })
  }

  const updateSelectedUser = async () => {
    if (!selectedUserId) return

    setMessage('')
    const existing = users.find((item) => item.id === selectedUserId)
    if (!existing) return

    const optimistic = users.map((item) =>
      item.id === selectedUserId
        ? {
            ...item,
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            phoneNumber: editForm.phoneNumber,
            role: editForm.role,
            isActive: editForm.isActive,
          }
        : item,
    )
    setUsers(optimistic)

    try {
      const updated = await adminUpdateUser(selectedUserId, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        role: editForm.role,
        isActive: editForm.isActive,
      })
      setUsers((prev) => prev.map((item) => (item.id === selectedUserId ? updated : item)))
      setMessage('User updated')
      setSelectedUserId(null)
    } catch {
      setUsers((prev) => prev.map((item) => (item.id === selectedUserId ? existing : item)))
      setMessage('Failed to save user changes')
    }
  }

  const removeUser = async (userId: string) => {
    const ok = window.confirm('WARNING: This will permanently delete this user and related data. Continue?')
    if (!ok) return

    const previous = users
    setUsers((prev) => prev.filter((item) => item.id !== userId))

    try {
      await adminDeleteUser(userId)
      setMessage('User deleted')
    } catch {
      setUsers(previous)
      setMessage('Failed to delete user')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-6 pt-12 pb-24">
      <h1 className="font-playfair text-3xl text-slate-800 text-center mb-8">User Management</h1>

      <div className="border border-teal-100/40 rounded-xl p-4 mb-8 bg-teal-50/10 space-y-3">
        <p className="text-xs tracking-widest uppercase text-slate-400">Add User</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.firstName} onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))} placeholder="First name" className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm" />
          <input value={form.lastName} onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))} placeholder="Last name" className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm" />
          <input value={form.phoneNumber} onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))} placeholder="Phone (10 digits)" className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm" />
          <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Password" className="bg-white border border-teal-100/40 rounded-lg p-3 text-sm" />
        </div>
        <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as 'ADMIN' | 'CLIENT' }))} className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm">
          <option value="CLIENT">CLIENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button onClick={() => void addUser()} className="w-full py-3 bg-emerald-500 text-white rounded-lg text-xs tracking-widest uppercase font-semibold">Add User</button>
      </div>

      {message ? <p className="text-xs text-emerald-600 mb-4">{message}</p> : null}
      {isLoading ? <p className="text-sm text-slate-400 mb-4">Loading users...</p> : null}

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => startEditUser(user)}
            className="border border-teal-100/40 rounded-lg p-4 bg-white/30 space-y-3 cursor-pointer"
          >
            <div>
              <p className="text-slate-800 text-sm">{user.firstName} {user.lastName}</p>
              <p className="text-slate-400 text-xs">{user.phoneNumber}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-600 tracking-wider">{user.role}</span>
              <span className="text-xs text-slate-400">{user.isActive ? 'Active' : 'Inactive'}</span>
            </div>

            <p className="text-xs text-slate-400">Active since: {formatDate(user.createdAt)}</p>

            <button
              onClick={(event) => {
                event.stopPropagation()
                void removeUser(user.id)
              }}
              className="px-3 py-2 border border-red-400/50 rounded-lg text-xs tracking-widest uppercase text-red-300"
            >
              Delete
            </button>

            {selectedUserId === user.id ? (
              <div className="border-t border-teal-100/30 pt-3 space-y-3" onClick={(event) => event.stopPropagation()}>
                <p className="text-xs tracking-widest uppercase text-slate-400">Edit User</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={editForm.firstName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    className="bg-white border border-teal-100/40 rounded-lg p-2 text-sm"
                  />
                  <input
                    value={editForm.lastName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    className="bg-white border border-teal-100/40 rounded-lg p-2 text-sm"
                  />
                  <input
                    value={editForm.phoneNumber}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                    className="bg-white border border-teal-100/40 rounded-lg p-2 text-sm"
                  />
                  <select
                    value={editForm.role}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value as 'ADMIN' | 'CLIENT' }))}
                    className="bg-white border border-teal-100/40 rounded-lg p-2 text-sm"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <label className="text-xs text-slate-400 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Active
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => void updateSelectedUser()}
                    className="py-2 bg-emerald-500 text-white rounded-lg text-xs tracking-widest uppercase font-semibold"
                  >
                    Update User
                  </button>
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="py-2 border border-teal-100/40 rounded-lg text-xs tracking-widest uppercase text-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
