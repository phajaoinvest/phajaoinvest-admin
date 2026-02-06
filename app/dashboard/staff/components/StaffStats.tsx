'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { User as UserIcon, UserCheck, KeyRound } from 'lucide-react'
import { Role } from '@/lib/types'

interface StaffStatsProps {
    totalStaff: number
    activeStaff: number
    roles: Role[]
}

export const StaffStats: React.FC<StaffStatsProps> = ({ totalStaff, activeStaff, roles }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-transparent rounded-sm">
                <CardContent className="py-0 px-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Total Staff
                            </p>
                            <p className="text-lg font-bold">{totalStaff}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <UserIcon size={18} className="text-blue-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-transparent rounded-sm">
                <CardContent className="py-0 px-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Active Staff
                            </p>
                            <p className="text-lg font-bold">{activeStaff}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <UserCheck size={18} className="text-green-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-transparent rounded-sm">
                <CardContent className="py-0 px-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Total Roles
                            </p>
                            <p className="text-lg font-bold">{roles.length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <KeyRound size={18} className="text-yellow-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
