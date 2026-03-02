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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6">
      <h1 className="font-playfair text-3xl text-luxury-white text-center mb-8">User Management</h1>

      <div className="border border-luxury-brown/40 rounded-xl p-4 mb-8 bg-luxury-green/25 space-y-3">
        <p className="text-xs tracking-widest uppercase text-luxury-muted">Add User</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.firstName} onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))} placeholder="First name" className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white" />
          <input value={form.lastName} onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))} placeholder="Last name" className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white" />
          <input value={form.phoneNumber} onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))} placeholder="Phone (10 digits)" className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white" />
          <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Password" className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white" />
        </div>
        <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as 'ADMIN' | 'CLIENT' }))} className="w-full bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white">
          <option value="CLIENT">CLIENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button onClick={() => void addUser()} className="w-full py-3 bg-luxury-gold text-luxury-black rounded-lg text-xs tracking-widest uppercase font-semibold">Add User</button>
      </div>

      {message ? <p className="text-xs text-luxury-champagne mb-4">{message}</p> : null}
      {isLoading ? <p className="text-sm text-luxury-muted mb-4">Loading users...</p> : null}

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => startEditUser(user)}
            className="border border-luxury-brown/40 rounded-lg p-4 bg-luxury-green/20 space-y-3 cursor-pointer"
          >
            <div>
              <p className="text-luxury-white text-sm">{user.firstName} {user.lastName}</p>
              <p className="text-luxury-muted text-xs">{user.phoneNumber}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-luxury-champagne tracking-wider">{user.role}</span>
              <span className="text-xs text-luxury-muted">{user.isActive ? 'Active' : 'Inactive'}</span>
            </div>

            <p className="text-xs text-luxury-muted">Active since: {formatDate(user.createdAt)}</p>

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
              <div className="border-t border-luxury-brown/30 pt-3 space-y-3" onClick={(event) => event.stopPropagation()}>
                <p className="text-xs tracking-widest uppercase text-luxury-muted">Edit User</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={editForm.firstName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-2 text-sm text-luxury-white"
                  />
                  <input
                    value={editForm.lastName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-2 text-sm text-luxury-white"
                  />
                  <input
                    value={editForm.phoneNumber}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                    className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-2 text-sm text-luxury-white"
                  />
                  <select
                    value={editForm.role}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value as 'ADMIN' | 'CLIENT' }))}
                    className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-2 text-sm text-luxury-white"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <label className="text-xs text-luxury-muted flex items-center gap-2">
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
                    className="py-2 bg-luxury-gold text-luxury-black rounded-lg text-xs tracking-widest uppercase font-semibold"
                  >
                    Update User
                  </button>
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="py-2 border border-luxury-brown/40 rounded-lg text-xs tracking-widest uppercase text-luxury-muted"
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
