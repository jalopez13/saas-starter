import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { authMiddleware } from '@/lib/middleware'
import { AppLayout } from '@/src/components/AppLayout'
import { useTheme } from '@/lib/theme-provider'
import { toast } from 'sonner'
import {
  User,
  Shield,
  Palette,
  Mail,
  Sun,
  Moon,
  Monitor,
  LogOut,
  AlertTriangle,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  server: {
    middleware: [authMiddleware],
  },
})

type Tab = 'profile' | 'security' | 'appearance'

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
  ]

  return (
    <AppLayout
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="max-w-2xl space-y-6">
        <div className="inline-flex gap-1 rounded border border-border bg-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
      </div>
    </AppLayout>
  )
}

function ProfileTab() {
  const { data: session } = authClient.useSession()
  const [displayName, setDisplayName] = useState(session?.user?.name || '')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  const handleSaveProfile = async () => {
    try {
      await authClient.updateUser({
        name: displayName,
        image: avatarUrl || undefined,
      })
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleChangeEmail = async () => {
    if (!newEmail || !emailPassword) {
      toast.error('Please fill in all fields')
      return
    }
    try {
      await authClient.changeEmail({
        newEmail,
        callbackURL: '/settings',
      })
      toast.success('Verification email sent to your new address')
      setNewEmail('')
      setEmailPassword('')
    } catch (error) {
      toast.error('Failed to change email')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded border border-border bg-card p-6">
        <h3 className="font-semibold">Profile Information</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal information and profile picture
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={session?.user?.email || ''}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              To change your email, use the form below
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to your profile picture
            </p>
          </div>

          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </div>
      </div>

      <div className="rounded border border-border bg-card p-6">
        <h3 className="font-semibold">Account Information</h3>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">Free Plan</p>
            </div>
            <Link to="/billing">
              <Button variant="outline" size="sm">
                Manage Billing
              </Button>
            </Link>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium">Account Status</p>
            <p className="text-sm text-muted-foreground">Unverified</p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium">Member Since</p>
            <p className="text-sm text-muted-foreground">
              {session?.user?.createdAt
                ? new Date(session.user.createdAt).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Change Email</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your email address. You'll need to verify the new email.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="samsmith@gmail.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailPassword">Current Password</Label>
            <Input
              id="emailPassword"
              type="password"
              placeholder="••••••••••••"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleChangeEmail}>Change Email</Button>
        </div>
      </div>
    </div>
  )
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  const handleLogoutAll = async () => {
    try {
      await authClient.revokeOtherSessions()
      toast.success('Logged out from all other devices')
    } catch (error) {
      toast.error('Failed to logout from other devices')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }
    try {
      await authClient.deleteUser({
        password: deletePassword,
      })
      toast.success('Account deleted')
      window.location.href = '/'
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded border border-border bg-card p-6">
        <h3 className="font-semibold">Change Password</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your password to keep your account secure
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleChangePassword}>Change Password</Button>
        </div>
      </div>

      <div className="rounded border border-border bg-card p-6">
        <h3 className="font-semibold">Active Sessions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your active sessions across devices
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Logout from all devices</p>
            <p className="text-sm text-muted-foreground">
              This will invalidate all active sessions
            </p>
          </div>
          <Button variant="destructive" onClick={handleLogoutAll}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout All
          </Button>
        </div>
      </div>

      <div className="rounded border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <h3 className="font-semibold">Danger Zone</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Irreversible and destructive actions
        </p>

        <div className="mt-6 rounded border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <p className="font-medium text-destructive">Delete Account</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            This will permanently delete your account and all your data
            including ideas, pain points, and saved searches. This action cannot
            be undone.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deletePassword">Password</Label>
            <Input
              id="deletePassword"
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deleteConfirm">
              Type <span className="font-bold text-destructive">DELETE</span> to
              confirm
            </Label>
            <Input
              id="deleteConfirm"
              placeholder="DELETE"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>

          <Button variant="destructive" onClick={handleDeleteAccount}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete My Account
          </Button>
        </div>
      </div>
    </div>
  )
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'system' as const, label: 'System', icon: Monitor },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded border border-border bg-card p-6">
        <h3 className="font-semibold">Theme</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select your preferred color scheme
        </p>

        <div className="mt-6 flex gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'flex flex-1 flex-col items-center gap-3 rounded border-2 p-6 transition-colors',
                theme === t.id
                  ? 'border-primary'
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                  theme === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <t.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Currently using {theme} theme
        </p>
      </div>
    </div>
  )
}
