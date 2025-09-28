import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'success' | 'warning' | 'error';
}

export function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'primary'
}: StatsCardProps) {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-success-50 text-success-600',
        warning: 'bg-warning-50 text-warning-600',
        error: 'bg-error-50 text-error-600',
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${trend.isPositive ? 'text-success-600' : 'text-error-600'
                                }`}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-sm text-gray-500 ml-1">vs last period</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
