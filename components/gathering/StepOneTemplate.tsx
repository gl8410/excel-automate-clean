import React from 'react';
import { Card, CardContent } from '../ui/card';
import { FileDropzone } from '../FileDropzone';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TableProperties, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TemplateColumn } from '../../types';

interface StepOneTemplateProps {
    t: any;
    templateFile: File | null;
    templateColumns: TemplateColumn[];
    isTemplateConfirmed: boolean;
    isTemplateLoading: boolean;
    activeTab: string;
    onSetActiveTab: (tab: string) => void;
    onUploadTemplate: (files: File[]) => void;
    onRemoveTemplate: () => void;
}

export function StepOneTemplate({
    t,
    templateFile,
    templateColumns,
    isTemplateConfirmed,
    isTemplateLoading,
    activeTab,
    onSetActiveTab,
    onUploadTemplate,
    onRemoveTemplate,
}: StepOneTemplateProps) {
    return (
        <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#2C3444] flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#3A4559]">
                    1
                </span>
                {t.step1Title}
            </h3>

            {!templateFile ? (
                <FileDropzone label={t.uploadTgt} onFilesSelected={onUploadTemplate} />
            ) : (
                <Card
                    onClick={() => onSetActiveTab('template')}
                    className={cn(
                        "cursor-pointer transition-all hover:border-indigo-300 dark:hover:border-indigo-500/50 group relative",
                        activeTab === 'template' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-[#2C3444]'
                    )}
                >
                    <CardContent className="p-4 flex items-start gap-3">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 text-green-600">
                            <TableProperties size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{templateFile.name}</p>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                {isTemplateLoading ? (
                                    <Badge variant="secondary" className="h-5 px-1.5">
                                        <Loader2 size={10} className="animate-spin mr-1" /> {t.analyzing}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="h-5 px-1.5 bg-white">
                                        {templateColumns.length} {t.colStruct}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveTemplate();
                            }}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </CardContent>
                    {isTemplateConfirmed && (
                        <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 size={14} />
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
