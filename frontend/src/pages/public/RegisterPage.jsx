import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useAuthStore from '@/context/authStore'
import toast from 'react-hot-toast'

const departments = [
  'Computer Science', 'Engineering', 'Business Administration',
  'Arts & Humanities', 'Natural Sciences', 'Law', 'Medicine',
  'Education', 'Social Sciences', 'Architecture',
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    studentId: '', department: '', role: 'STUDENT',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.studentId.trim()) errs.studentId = 'Student ID is required'
    if (!form.department) errs.department = 'Department is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const { confirmPassword, ...data } = form
      await register(data)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm">Join the Student Union Election System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Fill in your details to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" value={form.fullName} onChange={set('fullName')} className={errors.fullName ? 'border-destructive' : ''} />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input placeholder="STU001" value={form.studentId} onChange={set('studentId')} className={errors.studentId ? 'border-destructive' : ''} />
                  {errors.studentId && <p className="text-xs text-destructive">{errors.studentId}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')} className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={set('department')}>
                    <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={set('role')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student / Voter</SelectItem>
                      <SelectItem value="CANDIDATE">Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
