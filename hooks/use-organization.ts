import { useSession } from '@/lib/auth-client'
import { orgClient } from '@/lib/auth-client'
import { useEffect, useState } from 'react'

export interface Organization {
  id: string
  name: string
  slug: string
}

export function useOrganization() {
  const { data: session } = useSession()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await orgClient.list({
          query: { userId: session.user.id },
        })

        if (error) {
          setError(error.message || 'Failed to fetch organization')
          return
        }

        // Return the first organization (assuming single org per user)
        setOrganization(data && data.length > 0 ? data[0] : null)
      } catch {
        setError('Failed to load organization')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [session?.user?.id, session?.user])

  return {
    organization,
    loading,
    error,
    refetch: () => {
      if (session?.user) {
        setLoading(true)
        setError(null)
        // Re-run the effect by updating a dependency
      }
    }
  }
}