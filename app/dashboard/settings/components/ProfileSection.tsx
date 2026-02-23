import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import type { AdminProfile } from '@/lib/types'

interface ProfileSectionProps {
    profile: AdminProfile | null
    profileLoading: boolean
    profileSaving: boolean
    firstName: string
    lastName: string
    tel: string
    setFirstName: (val: string) => void
    setLastName: (val: string) => void
    setTel: (val: string) => void
    onSave: () => Promise<void>
}

export function ProfileSection({
    profile,
    profileLoading,
    profileSaving,
    firstName,
    lastName,
    tel,
    setFirstName,
    setLastName,
    setTel,
    onSave,
}: ProfileSectionProps) {
    return (
        <Card className="p-6 bg-card border-border/40">
            <h3 className="text-lg font-medium mb-4">Profile Settings</h3>
            {profileLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={profile?.username || ''}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            value={profile?.role || 'N/A'}
                            disabled
                            className="bg-muted"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Account Created</Label>
                            <Input
                                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Updated</Label>
                            <Input
                                value={profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={onSave}
                        className="gap-2"
                        disabled={profileSaving}
                    >
                        {profileSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {profileSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            )}
        </Card>
    )
}
