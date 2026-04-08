import React from 'react';
import { Card } from '../ui/card';
import { FileDropzone } from '../FileDropzone';
import { Button } from '../ui/button';
import { Eraser, FileText, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FragmentFile } from '../../types';

interface StepTwoFragmentsProps {
    t: any;
    fragmentFiles: FragmentFile[];
    activeTab: string;
    isTemplateConfirmed: boolean;
    onSetActiveTab: (tab: string) => void;
    onClearFragments: () => void;
    onRemoveFragment: (id: string) => void;
    onUploadFragments: (files: File[]) => void;
}

export function StepTwoFragments({
    t,
    fragmentFiles,
    activeTab,
    isTemplateConfirmed,
    onSetActiveTab,
    onClearFragments,
    onRemoveFragment,
    onUploadFragments,
}: StepTwoFragmentsProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#2C3444] flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#3A4559]">
                        2
                    </span>
                    {t.step2Title}
                </h3>
                {fragmentFiles.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFragments}
                        className="h-6 text-[10px] text-slate-400 hover:text-red-500"
                    >
                        <Eraser size={12} className="mr-1" /> {t.clearAll}
                    </Button>
                )}
            </div>

            <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-1">
                {fragmentFiles.map((file) => (
                    <Card
                        key={file.id}
                        onClick={() => onSetActiveTab(file.id)}
                        className={cn(
                            "cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80 relative overflow-hidden",
                            activeTab === file.id
                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md ring-1 ring-indigo-500/20'
                                : 'border-slate-200 dark:border-[#2C3444]'
                        )}
                    >
                        <div
                            className={cn(
                                "w-1 absolute left-0 top-0 bottom-0",
                                file.status === 'success'
                                    ? 'bg-green-500'
                                    : file.status === 'warning'
                                        ? 'bg-amber-400'
                                        : file.status === 'error'
                                            ? 'bg-red-500'
                                            : 'bg-slate-300 dark:bg-slate-600'
                            )}
                        />
                        <div className="p-3 flex items-center gap-3 pl-4">
                            <div>
                                {file.status === 'processing' ? (
                                    <Loader2 className="animate-spin text-indigo-500" size={18} />
                                ) : (
                                    <FileText className="text-slate-400" size={18} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                    {file.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    {file.status === 'pending' && t.pending}
                                    {file.status === 'processing' && t.processing}
                                    {file.status === 'success' && t.success}
                                    {file.status === 'warning' && t.warning}
                                    {file.status === 'error' && t.error}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-300 hover:text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFragment(file.id);
                                }}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </Card>
                ))}
                {fragmentFiles.length === 0 && (
                    <p className="text-center py-8 text-xs text-slate-300 dark:text-slate-500 italic">
                        {t.noFrag}
                    </p>
                )}
            </div>

            <FileDropzone
                label={t.uploadFrag}
                compact
                multiple
                disabled={!isTemplateConfirmed}
                onFilesSelected={onUploadFragments}
            />
        </div>
    );
}
