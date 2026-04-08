import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileDropzone } from '../FileDropzone';
import { readFullExcel } from '../../services/excelService';
import { supabase, supabaseAdmin } from '../../services/supabase';
import { Loader2, TableProperties, Settings2, Trash2, Download, Eye, RefreshCw, Coins, AlertTriangle } from 'lucide-react';

export type DataType = 'Text' | 'Number' | 'DateTime' | 'Boolean';
export type ActionType = 'Keep' | 'Delete' | 'Split';
export type NullAction = 'None' | '0' | 'N/A' | 'Drop' | 'Mean';

export interface CleaningColumn {
    originalIndex: number;
    originalName: string;
    newName: string;

    nullCount: number;
    totalCount: number;
    uniqueCount: number;

    dataType: DataType;
    action: ActionType;
    splitDelimiter: string;

    trimWhitespace: boolean;
    nullAction: NullAction;
}

const CLEANING_CREDIT_COST = 7;

export function DataCleaning({ t, isDark, userCredits, fetchCredits }: { t: any, isDark: boolean, userCredits: number | null, fetchCredits: (userId: string) => Promise<void> }) {
    const [file, setFile] = useState<File | null>(null);
    const [cols, setCols] = useState<CleaningColumn[]>([]);
    const [rawData, setRawData] = useState<any[][]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any[][] | null>(null);

    const handleUpload = async (files: File[]) => {
        if (!files.length) return;
        const f = files[0];
        setFile(f);
        setIsLoading(true);

        try {
            const data = await readFullExcel(f);
            if (data.length === 0) return;

            const headerRow = data[0];
            const dataRows = data.slice(1);

            const initCols: CleaningColumn[] = headerRow.map((header: string, idx: number) => {
                const colData = dataRows.map(r => r[idx]);
                const nulls = colData.filter(v => v === null || v === undefined || v === '').length;
                const uniqs = new Set(colData.filter(v => v !== null && v !== undefined && v !== '')).size;

                return {
                    originalIndex: idx,
                    originalName: header || `Column ${idx + 1}`,
                    newName: header || `Column ${idx + 1}`,
                    nullCount: nulls,
                    totalCount: dataRows.length,
                    uniqueCount: uniqs,
                    dataType: 'Text',
                    action: 'Keep',
                    splitDelimiter: ',',
                    trimWhitespace: false,
                    nullAction: 'None'
                };
            });

            setRawData(data);
            setCols(initCols);
            setPreviewData(null);
        } catch (e) {
            console.error(e);
            alert("Error reading file.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateCol = (idx: number, updates: Partial<CleaningColumn>) => {
        const newCols = [...cols];
        newCols[idx] = { ...newCols[idx], ...updates };
        setCols(newCols);
    };

    const performCleaning = (dataRows: any[][], columns: CleaningColumn[]) => {
        // Determine new headers
        let finalHeaders: string[] = [];
        columns.forEach(c => {
            if (c.action === 'Delete') return;
            if (c.action === 'Split') {
                finalHeaders.push(`${c.newName}_1`);
                finalHeaders.push(`${c.newName}_2`);
            } else {
                finalHeaders.push(c.newName);
            }
        });

        // Determine row operations
        // Note: Drop rows relies on across-column metrics. If any col drops, whole row drops.
        let cleanedRows: any[][] = [];

        // Calculate mean for numeric cols replacing NULLs
        const means: Record<number, number> = {};
        columns.forEach(c => {
            if (c.nullAction === 'Mean' && c.dataType === 'Number') {
                const vals = dataRows.map(r => Number(r[c.originalIndex])).filter(v => !isNaN(v));
                means[c.originalIndex] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            }
        });

        for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
            let row = dataRows[rIdx];
            let dropRow = false;
            let newRow: any[] = [];

            for (let c of columns) {
                if (c.action === 'Delete') continue;

                let val = row[c.originalIndex];

                // 1. Handle Nulls
                const isNull = val === null || val === undefined || val === '';
                if (isNull) {
                    if (c.nullAction === 'Drop') { dropRow = true; break; }
                    else if (c.nullAction === '0') { val = '0'; }
                    else if (c.nullAction === 'N/A') { val = 'N/A'; }
                    else if (c.nullAction === 'Mean' && c.dataType === 'Number') { val = means[c.originalIndex]; }
                }

                // 2. Trim whitespace
                if (c.trimWhitespace && typeof val === 'string') {
                    val = val.trim();
                }

                // 3. Type casts formatting (mock simple)
                if (c.dataType === 'Number' && val !== null && val !== undefined) {
                    const num = Number(val);
                    val = isNaN(num) ? val : num;
                }

                // 4. Split
                if (c.action === 'Split') {
                    const parts = (typeof val === 'string' ? val : String(val || '')).split(c.splitDelimiter || ',');
                    newRow.push(parts[0] || null);
                    newRow.push(parts.slice(1).join(c.splitDelimiter) || null);
                } else {
                    newRow.push(val);
                }
            }

            if (!dropRow) {
                cleanedRows.push(newRow);
            }
        }

        return [finalHeaders, ...cleanedRows];
    };

    const handlePreview = () => {
        setIsLoading(true);
        setTimeout(() => {
            const dataRows = rawData.slice(1);
            const output = performCleaning(dataRows, cols);
            setPreviewData(output.slice(0, 11)); // Header + Top 10 rows
            setIsLoading(false);
        }, 500);
    };

    const handleDownload = async () => {
        if (!file) return;

        // 1. Verify user session
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
            alert('请先登录 (Please login first)');
            return;
        }

        const cost = CLEANING_CREDIT_COST;

        // 2. Credit check
        if (userCredits !== null && userCredits < cost) {
            alert(`积分不足，无法下载。\n需要积分: ${cost}\n当前积分: ${userCredits}\n\nInsufficient credits. Need ${cost}, have ${userCredits}.`);
            return;
        }

        // 3. Confirmation popup
        const confirmed = window.confirm(
            `本次清洗下载将扣除 ${cost} 积分，是否继续？\n(This download will deduct ${cost} credits. Continue?)`
        );
        if (!confirmed) return;

        setIsLoading(true);
        try {
            const dataRows = rawData.slice(1);
            const output = performCleaning(dataRows, cols);

            const XLSX = (window as any).XLSX;
            if (!XLSX) {
                alert('XLSX not loaded.');
                return;
            }

            // 4. Write file
            const ws = XLSX.utils.aoa_to_sheet(output);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'CleanedData');
            XLSX.writeFile(wb, `Cleaned_${file?.name || 'Data'}.xlsx`);

            // 5. Deduct credits via supabase RPC (recorded to public.usage_logs)
            const { error: deductError } = await supabaseAdmin.rpc('deduct_credits', {
                p_user_id: user.id,
                p_cost_amount: cost,
                p_app_id: 'Excel cleaning',
                p_feature_name: 'Excel clean',
                p_metadata: {}
            });

            if (deductError) {
                console.error('Failed to deduct credits:', deductError);
            } else {
                // 6. Refresh credits display
                await fetchCredits(user.id);
            }
        } catch (e) {
            console.error(e);
            alert('下载失败 (Download failed)');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 gap-6">

            {/* Configuration Sidebar */}
            <div className="w-[480px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar border-r border-slate-200 dark:border-slate-800 pr-6">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Settings2 className="text-indigo-600" />
                    {t.appCleaning || '数据清洗 Data Cleaning'}
                </h2>

                {!file ? (
                    <FileDropzone label="上传需清洗的Excel (Upload Excel)" onFilesSelected={handleUpload} />
                ) : (
                    <Card className="border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-800 shadow-sm relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 hover:text-red-500" onClick={() => { setFile(null); setCols([]); setPreviewData(null); }}>
                            <Trash2 size={14} />
                        </Button>
                        <CardContent className="p-4 pr-10">
                            <p className="font-semibold text-sm truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{cols.length} Columns • {rawData.length - 1} Rows</p>
                        </CardContent>
                    </Card>
                )}

                {cols.map((c, i) => (
                    <Card key={i} className={`p-4 shadow-sm border ${c.action === 'Delete' ? 'opacity-50 grayscale border-red-200' : 'border-slate-200 dark:border-slate-700'} dark:bg-slate-800`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <input
                                    className="font-semibold text-sm bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 outline-none w-[90%] focus:border-indigo-500 mb-1"
                                    value={c.newName}
                                    onChange={e => updateCol(i, { newName: e.target.value })}
                                />
                                <div className="text-[10px] text-slate-500 flex gap-2 font-mono">
                                    <span title="Nulls">∅ {c.nullCount} ({((c.nullCount / c.totalCount) * 100).toFixed(1)}%)</span>
                                    <span title="Unique">U {c.uniqueCount}</span>
                                </div>
                            </div>
                            <select
                                className="text-xs border rounded p-1 dark:bg-slate-900 dark:border-slate-700 outline-none"
                                value={c.action}
                                onChange={e => updateCol(i, { action: e.target.value as ActionType })}
                            >
                                <option value="Keep">Keep (保留)</option>
                                <option value="Delete">Delete (删除)</option>
                                <option value="Split">Split (分割)</option>
                            </select>
                        </div>

                        {c.action !== 'Delete' && (
                            <div className="space-y-2 mt-3 text-xs bg-slate-50 dark:bg-slate-900/50 p-2 rounded">

                                <div className="flex justify-between items-center">
                                    <label className="text-slate-600 dark:text-slate-400">Data Type</label>
                                    <select className="border rounded p-1" value={c.dataType} onChange={e => updateCol(i, { dataType: e.target.value as DataType })}>
                                        <option value="Text">Text</option>
                                        <option value="Number">Number</option>
                                        <option value="DateTime">DateTime</option>
                                        <option value="Boolean">Boolean</option>
                                    </select>
                                </div>

                                {c.action === 'Split' && (
                                    <div className="flex justify-between items-center">
                                        <label className="text-slate-600 dark:text-slate-400 text-[10px]">Delimiter</label>
                                        <input className="border rounded p-1 w-20 text-center" value={c.splitDelimiter} onChange={e => updateCol(i, { splitDelimiter: e.target.value })} placeholder="e.g. ," />
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <label className="flex items-center gap-1">
                                        <input type="checkbox" checked={c.trimWhitespace} onChange={e => updateCol(i, { trimWhitespace: e.target.checked })} /> Trim Spaces
                                    </label>

                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-500 hidden sm:inline">Nulls:</span>
                                        <select className="border rounded p-1" value={c.nullAction} onChange={e => updateCol(i, { nullAction: e.target.value as NullAction })}>
                                            <option value="None">Skip</option>
                                            <option value="0">Set 0</option>
                                            <option value="N/A">Set N/A</option>
                                            {c.dataType === 'Number' && <option value="Mean">Fill Mean</option>}
                                            <option value="Drop">Drop Row</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Preview & Action Panel */}
            <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1E2532] shadow-sm overflow-hidden">
                <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                        <Eye size={16} className="text-slate-500" /> Preview (Top 10)
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePreview} disabled={!file || isLoading}>
                            {isLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : <RefreshCw size={14} className="mr-1" />} Preview
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleDownload} disabled={!file || isLoading || !previewData}>
                            <Download size={14} className="mr-1" /> Download
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 custom-scrollbar relative">
                    {!file ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <TableProperties size={64} className="mb-4" />
                            <p>Upload a file and configure rules to preview data.</p>
                        </div>
                    ) : !previewData ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <p>Configure columns on the left and click <b>Preview</b> to test outcome.</p>
                        </div>
                    ) : (
                        <table className="w-fulltext-left border-collapse text-xs whitespace-nowrap">
                            <thead>
                                <tr>
                                    {previewData[0]?.map((h: string, i: number) => (
                                        <th key={i} className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-100 dark:bg-slate-800 font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.slice(1).map((row, ri) => (
                                    <tr key={ri} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        {row.map((cell: any, ci: number) => (
                                            <td key={ci} className="border border-slate-200 dark:border-slate-700 px-3 py-2 max-w-[200px] truncate" title={cell}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
}
