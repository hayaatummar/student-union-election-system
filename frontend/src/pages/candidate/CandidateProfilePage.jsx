import { useEffect, useState, useRef } from 'react'
import { Save, Upload, Loader2, Trophy, Link as LinkIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { candidateService } from '@/services/candidateService'
import { electionService } from '@/services/electionService'
import { getInitials, getStatusColor } from '@/utils/helpers'
import useAuthStore from '@/context/authStore'
import toast from 'react-hot-toast'

export default function CandidateProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ manifesto: '', year: '', semester: '', twitter: '', linkedin: '' })
  const posterRef = useRef()

  useEffect(() => {
    candidateService.getMyProfile()
      .then((r) => {
        const p = r.data.data
        setProfile(p)
        setForm({
          manifesto: p.manifesto || '',
          year: p.year || '',
          semester: p.semester || '',
          twitter: p.socialLinks?.twitter || '',
          linkedin: p.socialLinks?.linkedin || '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('manifesto', form.manifesto)
      formData.append('year', form.year)
      formData.append('semester', form.semester)
      formData.append('socialLinks', JSON.stringify({ twitter: form.twitter, linkedin: form.linkedin }))
      if (form.poster) formData.append('campaignPoster', form.poster)

      const res = await candidateService.updateProfile(formData)
      setProfile(res.data.data)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />

  if (!profile) return (
    <div className="space-y-6">
      <PageHeader title="My Campaign" />
      <EmptyState
        icon={Trophy}
        title="No candidate profile found"
        description="You haven't applied for any election yet. Apply from the Elections page."
      />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="My Campaign Profile" description="Manage your election campaign" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{profile.voteCount}</p>
            <p className="text-sm text-muted-foreground">Votes Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium">{profile.position?.title}</p>
            <p className="text-xs text-muted-foreground">Position</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(profile.status)}`}>
              {profile.status}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Poster */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Poster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {(form.posterPreview || profile.campaignPoster) ? (
              <img
                src={form.posterPreview || profile.campaignPoster}
                alt="Campaign poster"
                className="h-32 w-48 object-cover rounded-lg border"
              />
            ) : (
              <div className="h-32 w-48 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                <p className="text-xs text-muted-foreground">No poster</p>
              </div>
            )}
            <div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => posterRef.current?.click()}>
                <Upload className="h-4 w-4" /> Upload Poster
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Max 5MB. JPG, PNG, WebP</p>
              <input
                ref={posterRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) setForm((f) => ({ ...f, poster: file, posterPreview: URL.createObjectURL(file) }))
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Details</CardTitle>
          <CardDescription>Update your manifesto and campaign information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Manifesto</Label>
              <Textarea
                value={form.manifesto}
                onChange={(e) => setForm({ ...form, manifesto: e.target.value })}
                rows={5}
                placeholder="Describe your vision and plans for the student union..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 3rd Year" />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="e.g. 6th Semester" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Twitter / X</Label>
              <Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="https://twitter.com/username" />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" />
            </div>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
