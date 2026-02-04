import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut()
    toast.success('Logged out successfully!')
    navigate({ to: '/login' })
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Sign out
    </Button>
  )
}
