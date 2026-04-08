import React, { useState } from 'react';
import { ColumnViewer } from '../ColumnViewer';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { StepOneTemplate } from './StepOneTemplate';
import { StepTwoFragments } from './StepTwoFragments';
import { readExcelPreview, readFullExcel, generateMergedExcel } from '../../services/excelService';
import { apiService } from '../../services/api';
import { supabase } from '../../services/supabase';
import { APP_CONFIG } from '../../app.config';
import { TemplateColumn, FragmentFile } from '../../types';
import { Database, Loader2, TableProperties, PartyPopper, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

export function ExcelGathering({ t, userEmail, userCredits, fetchCredits, activeTab, setActiveTab }: any) {
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [templateColumns, setTemplateColumns] = useState<TemplateColumn[]>([]);
    const [isTemplateConfirmed, setIsTemplateConfirmed] = useState(false);
    const [isTemplateLoading, setIsTemplateLoading] = useState(false);

    const [fragmentFiles, setFragmentFiles] = useState<FragmentFile[]>([]);
    const [isGathering, setIsGathering] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleTemplateUpload = async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setTemplateFile(file);
        setIsTemplateLoading(true);

        try {
            const previewData = await readExcelPreview(file);
            const columns = await apiService.analyzeTemplate(previewData);
            setTemplateColumns(columns);
            setActiveTab('template');
        } catch (error) {
            console.error("Template Error", error);
            alert("分析模板失败 (Failed to analyze template)");
            setTemplateFile(null);
        } finally {
            setIsTemplateLoading(false);
        }
    };

    const handleUpdateTemplateColumn = (index: number, newDesc: string) => {
        setTemplateColumns(prev => prev.map(c =>
            c.index === index ? { ...c, description: newDesc } : c
        ));
    };

    const handleImportConfig = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = e.target?.result as string;
                const config = JSON.parse(json) as TemplateColumn[];
                if (Array.isArray(config) && config.length > 0) {
                    setTemplateColumns(config);
                    alert("配置导入成功！");
                }
            } catch (err) {
                alert("无效的配置文件。");
            }
        };
        reader.readAsText(file);
    };

    const handleFragmentUpload = async (files: File[]) => {
        if (!templateFile || !isTemplateConfirmed) {
            alert(t.plsConfirmTpl);
            return;
        }

        const newFragments: FragmentFile[] = files.map(f => ({
            id: Math.random().toString(36).substring(7),
            name: f.name,
            file: f,
            status: 'pending',
            mappings: []
        }));

        setFragmentFiles(prev => [...prev, ...newFragments]);
        newFragments.forEach(f => processFragment(f));
    };

    const processFragment = async (fragment: FragmentFile) => {
        setFragmentFiles(prev => prev.map(f => f.id === fragment.id ? { ...f, status: 'processing' } : f));
        try {
            const previewData = await readExcelPreview(fragment.file, 100);
            const result = await apiService.mapFragment(previewData, templateColumns);

            const selectedTemplateCols = templateColumns.filter(tc => tc.selected);
            const missing = selectedTemplateCols.filter(tc => {
                const m = result.mappings.find(map => map.templateHeader === tc.originalHeader);
                return !m || m.fragmentIndex === -1;
            });

            const status = missing.length === 0 ? 'success' : 'warning';
            setFragmentFiles(prev => prev.map(f => f.id === fragment.id ? {
                ...f,
                status,
                mappings: result.mappings,
                headerRowIndex: result.headerRowIndex
            } : f));
        } catch (e) {
            console.error(e);
            setFragmentFiles(prev => prev.map(f => f.id === fragment.id ? { ...f, status: 'error', errorMessage: t.processFail } : f));
        }
    };

    const handleUpdateMapping = (fragmentId: string, templateHeader: string, fragmentIndex: number) => {
        setFragmentFiles(prev => prev.map(f => {
            if (f.id !== fragmentId) return f;

            const newMappings = [...f.mappings];
            const mIdx = newMappings.findIndex(m => m.templateHeader === templateHeader);

            if (mIdx > -1) {
                newMappings[mIdx] = { ...newMappings[mIdx], fragmentIndex };
            } else {
                newMappings.push({ templateHeader, fragmentIndex, confidence: 'high' });
            }

            const selectedTemplateCols = templateColumns.filter(tc => tc.selected);
            const missing = selectedTemplateCols.filter(tc => {
                const m = newMappings.find(map => map.templateHeader === tc.originalHeader);
                return !m || m.fragmentIndex === -1;
            });
            const status = missing.length === 0 ? 'success' : 'warning';

            return { ...f, mappings: newMappings, status };
        }));
    };

    const clearFragments = () => {
        if (confirm(t.confirmClear)) {
            setFragmentFiles([]);
            setActiveTab('template');
        }
    };

    const handleGatherData = async () => {
        if (!templateFile) return;

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
            alert(t.loginFirst);
            return;
        }

        const fragmentCount = fragmentFiles.filter(f => f.status !== 'error').length;
        if (fragmentCount === 0) return;
        const cost = 7 * fragmentCount;

        if (userCredits !== null && userCredits < cost) {
            alert(`${t.notEnoughCredits}\n${t.needCredits} ${cost}\n${t.currentCredits} ${userCredits}`);
            return;
        }

        if (!window.confirm(`${t.confirmDeduct} ${cost} ${t.creditsSuffix}\n(${fragmentCount} ${t.filesSuffix})`)) {
            return;
        }

        setIsGathering(true);
        try {
            let allMergedRows: any[][] = [];
            for (const frag of fragmentFiles) {
                if (frag.status === 'error') continue;
                const rawData = await readFullExcel(frag.file);
                const startRowIndex = (frag.headerRowIndex ?? 0) + 1;
                const dataRows = rawData.slice(startRowIndex);

                const reorderedRows = dataRows.map(row => {
                    const maxIndex = Math.max(...templateColumns.map(c => c.index));
                    const newRow = new Array(maxIndex + 1).fill(null);
                    templateColumns.forEach(tc => {
                        if (tc.selected) {
                            const mapping = frag.mappings.find(m => m.templateHeader === tc.originalHeader);
                            if (mapping && mapping.fragmentIndex !== -1) {
                                newRow[tc.index] = row[mapping.fragmentIndex];
                            }
                        }
                    });
                    return newRow;
                });
                allMergedRows = [...allMergedRows, ...reorderedRows];
            }
            await generateMergedExcel(templateFile, allMergedRows);

            if (user) {
                const res = await fetch(`${APP_CONFIG.api.baseUrl}/deduct-credits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        cost_amount: cost,
                        app_id: 'Excel gathering',
                        feature_name: 'Excel clean',
                        metadata: {}
                    })
                });
                if (res.ok) {
                    await fetchCredits(user.id);
                } else {
                    console.error("Failed to deduct credits:", await res.text());
                }
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (e) {
            alert(t.gatherFail);
        } finally {
            setIsGathering(false);
        }
    };

    return (
        <div className="flex flex-1 overflow-hidden relative">
            <LoadingOverlay isGathering={isGathering} title={t.gatheringTitle} description={t.gatheringDesc} />

            {/* Sidebar */}
            <div className="w-1/3 min-w-[380px] bg-white dark:bg-[#1E2532] border-r border-slate-200 dark:border-[#2C3444] flex flex-col shadow-sm z-10 h-full">
                <div className="p-6 border-b border-slate-100 dark:border-[#2C3444] bg-slate-50/50 dark:bg-[#181E29]">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Database size={20} />
                        </div>
                        Excel 智能汇总
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium ml-1">v2.1 • Natural Language Matching</p>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Step 1 */}
                    <StepOneTemplate
                        t={t}
                        templateFile={templateFile}
                        templateColumns={templateColumns}
                        isTemplateConfirmed={isTemplateConfirmed}
                        isTemplateLoading={isTemplateLoading}
                        activeTab={activeTab}
                        onSetActiveTab={setActiveTab}
                        onUploadTemplate={handleTemplateUpload}
                        onRemoveTemplate={() => { setTemplateFile(null); setTemplateColumns([]); setIsTemplateConfirmed(false); }}
                    />

                    {/* Step 2 */}
                    <StepTwoFragments
                        t={t}
                        fragmentFiles={fragmentFiles}
                        activeTab={activeTab}
                        isTemplateConfirmed={isTemplateConfirmed}
                        onSetActiveTab={setActiveTab}
                        onClearFragments={clearFragments}
                        onRemoveFragment={(id: string) => { setFragmentFiles(f => f.filter(x => x.id !== id)); if (activeTab === id) setActiveTab('template'); }}
                        onUploadFragments={handleFragmentUpload}
                    />
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-[#2C3444] bg-white dark:bg-[#1E2532]">
                    {showSuccess && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center gap-2 animate-bounce">
                            <PartyPopper size={14} /> {t.successAlert}
                        </div>
                    )}
                    <Button
                        onClick={handleGatherData}
                        className="w-full h-12 text-base shadow-lg hover:shadow-indigo-200/50 dark:shadow-none transition-all"
                        disabled={fragmentFiles.length === 0 || isGathering}
                    >
                        {isGathering ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" size={18} />}
                        {isGathering ? t.gatheringProcess : t.gatheringBtn}
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-hidden bg-slate-50/30 h-full">
                {activeTab === 'template' ? (
                    templateFile ? (
                        <ColumnViewer
                            type="template"
                            templateColumns={templateColumns}
                            isTemplateConfirmed={isTemplateConfirmed}
                            onToggleColumn={(idx: number) => setTemplateColumns(c => c.map(x => x.index === idx ? { ...x, selected: !x.selected } : x))}
                            onToggleAll={(sel: boolean) => setTemplateColumns(c => c.map(x => ({ ...x, selected: sel })))}
                            onUpdateColumn={handleUpdateTemplateColumn}
                            onConfirmTemplate={() => setIsTemplateConfirmed(true)}
                            onImportConfig={handleImportConfig}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm border-dashed">
                            <div className="bg-slate-50 p-6 rounded-full mb-4">
                                <TableProperties size={48} className="text-slate-200" />
                            </div>
                            <p className="font-medium text-lg text-slate-600">请先在左侧上传“目标模板”文件</p>
                            <p className="text-sm text-slate-400 mt-2 max-w-sm text-center">系统将分析模板的列名和结构，利用 AI 智能匹配后续上传的碎片文件。</p>
                        </div>
                    )
                ) : (
                    <ColumnViewer
                        type="fragment"
                        templateColumns={templateColumns}
                        fragmentFile={fragmentFiles.find(f => f.id === activeTab)}
                        onUpdateMapping={handleUpdateMapping}
                    />
                )}
            </div>
        </div>
    );
}
