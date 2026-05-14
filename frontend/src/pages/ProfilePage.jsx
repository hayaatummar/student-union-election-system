import { useState, useRef } from 'react'
import { Camera, Loader2, Save, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageHeader from '@/components/common/PageHeader'
import useAuthStore from '@/context/authStore'
import { userService } from '@/services/userService'
import { authService } from '@/services/authService'
import { getInitials, getRoleColor } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', department: user?.department || '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const fileRef = useRef()

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('fullName', profileForm.fullName)
      formData.append('department', profileForm.department)
      if (profileForm.avatar) formData.append('avatar', profileForm.avatar)

      const res = await userService.updateProfile(formData)
      updateUser(res.data.data)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setChangingPw(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPw(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileForm((prev) => ({ ...prev, avatar: file, avatarPreview: URL.createObjectURL(file) }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Profile Settings" description="Manage your account information" />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileForm.avatarPreview || user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${getRoleColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <Separator className="mb-6" />

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Student ID</Label>
                    <Input value={user?.studentId || ''} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={changingPw} className="gap-2">
                  {changingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
