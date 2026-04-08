import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminCreateUser, adminDeleteUser, adminGetUsers, adminUpdateUser, ManagedUser } from '../lib/api'
import { pageMotionProps } from '../lib/motion'

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
    <motion.div {...pageMotionProps} className="v2-admin-shell">
      <h1 className="v2-title mb-8 text-center text-3xl">User Management</h1>

      <div className="v2-card mb-8 v2-admin-stack p-4">
        <p className="v2-label">Add User</p>
        <div className="v2-admin-grid">
          <input value={form.firstName} onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))} placeholder="First name" className="v2-input" />
          <input value={form.lastName} onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))} placeholder="Last name" className="v2-input" />
          <input value={form.phoneNumber} onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))} placeholder="Phone (10 digits)" className="v2-input" />
          <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Password" className="v2-input" />
        </div>
        <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as 'ADMIN' | 'CLIENT' }))} className="v2-input">
          <option value="CLIENT">CLIENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button onClick={() => void addUser()} className="v2-btn-primary">Add User</button>
      </div>

      {message ? <p className="text-xs text-blue-600 dark:text-blue-300 mb-4">{message}</p> : null}
      {isLoading ? <p className="text-sm text-slate-500 dark:text-emerald-100/70 mb-4">Loading users...</p> : null}

      <div className="v2-admin-stack">
        {users.map((user) => (
          <div key={user.id} onClick={() => startEditUser(user)} className="v2-card cursor-pointer v2-admin-stack rounded-2xl p-4">
            <div>
              <p className="text-slate-900 dark:text-emerald-50 text-sm">{user.firstName} {user.lastName}</p>
              <p className="text-slate-500 dark:text-emerald-100/70 text-xs">{user.phoneNumber}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider text-emerald-700 dark:text-emerald-300">{user.role}</span>
              <span className="text-xs text-slate-500 dark:text-emerald-100/70">{user.isActive ? 'Active' : 'Inactive'}</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-emerald-100/70">Active since: {formatDate(user.createdAt)}</p>

            <button
              onClick={(event) => {
                event.stopPropagation()
                void removeUser(user.id)
              }}
              className="rounded-xl border border-red-300 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-500"
            >
              Delete
            </button>

            {selectedUserId === user.id ? (
              <div className="v2-admin-stack border-t border-slate-200 dark:border-emerald-900/60 pt-3" onClick={(event) => event.stopPropagation()}>
                <p className="text-xs tracking-widest uppercase text-slate-500 dark:text-emerald-100/70">Edit User</p>
                <div className="v2-admin-grid">
                  <input
                    value={editForm.firstName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    className="v2-input !p-2"
                  />
                  <input
                    value={editForm.lastName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    className="v2-input !p-2"
                  />
                  <input
                    value={editForm.phoneNumber}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                    className="v2-input !p-2"
                  />
                  <select
                    value={editForm.role}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value as 'ADMIN' | 'CLIENT' }))}
                    className="v2-input !p-2"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <label className="text-xs text-slate-500 dark:text-emerald-100/70 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Active
                </label>

                <div className="v2-admin-actions">
                  <button
                    onClick={() => void updateSelectedUser()}
                    className="v2-btn-primary !py-2"
                  >
                    Update User
                  </button>
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="py-2 border border-slate-200 dark:border-emerald-900/60 rounded-lg text-xs tracking-widest uppercase text-slate-500 dark:text-emerald-100/70"
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
