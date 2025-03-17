'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  username: string
}

export default function ApiTest() {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedEmail, setEditedEmail] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/users/1')
      return data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const { data } = await axios.patch(`https://jsonplaceholder.typicode.com/users/1`, updates)
      return data
    },
    onSuccess: newData => {
      queryClient.setQueryData(['user'], newData)
      setIsEditing(false)
    },
  })

  const handleEdit = () => {
    if (data) {
      setEditedName(data.name)
      setEditedEmail(data.email)
      setIsEditing(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      name: editedName,
      email: editedEmail,
    })
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>

      <div className="p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-4">User Data</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : data ? (
          <div className="space-y-4">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={e => setEditedEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
                >
                  Edit User
                </button>
                <pre className="bg-white p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
} 