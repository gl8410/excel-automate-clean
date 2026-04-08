import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from './card';

interface LoadingOverlayProps {
    isGathering: boolean;
    title: string;
    description: string;
}

export function LoadingOverlay({ isGathering, title, description }: LoadingOverlayProps) {
    if (!isGathering) return null;

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <Card className="w-[300px] border-[#2C3444] bg-[#252C3B] text-slate-200">
                <CardHeader className="text-center pb-2">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={40} />
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-slate-400">{description}</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
