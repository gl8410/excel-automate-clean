import React, { useState, useEffect } from 'react';
import { TemplateColumn, FragmentFile } from '../types';
import { Check, AlertTriangle, XCircle, ArrowRight, Edit2, Save, Download, Upload, ChevronDown } from 'lucide-react';
import { readExcelPreview } from '../services/excelService';

interface ColumnViewerProps {
  type: 'template' | 'fragment';
  templateColumns: TemplateColumn[];
  fragmentFile?: FragmentFile;
  onToggleColumn?: (index: number) => void;
  onToggleAll?: (selected: boolean) => void;
  onConfirmTemplate?: () => void;
  onUpdateColumn?: (index: number, newDescription: string) => void;
  onImportConfig?: (file: File) => void;
  onUpdateMapping?: (fragmentId: string, templateHeader: string, fragmentIndex: number) => void;
  isTemplateConfirmed?: boolean;
}

export const ColumnViewer: React.FC<ColumnViewerProps> = ({
  type,
  templateColumns,
  fragmentFile,
  onToggleColumn,
  onToggleAll,
  onConfirmTemplate,
  onUpdateColumn,
  onImportConfig,
  onUpdateMapping,
  isTemplateConfirmed
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [fragmentHeaders, setFragmentHeaders] = useState<string[]>([]);

  // Fetch headers for manual mapping when viewing a fragment
  useEffect(() => {
    if (type === 'fragment' && fragmentFile) {
        const fetchHeaders = async () => {
            const data = await readExcelPreview(fragmentFile.file);
            const headerRow = data[fragmentFile.headerRowIndex || 0] || [];
            setFragmentHeaders(headerRow.map((h, i) => h ? String(h) : `列 ${String.fromCharCode(65 + i)}`));
        };
        fetchHeaders();
    }
  }, [fragmentFile, type]);

  const startEditing = (col: TemplateColumn) => {
      setEditingIndex(col.index);
      setEditDesc(col.description);
  };

  const saveEditing = (index: number) => {
      if (onUpdateColumn) {
          onUpdateColumn(index, editDesc);
      }
      setEditingIndex(null);
  };

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateColumns, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "template_config.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
      document.getElementById('configInput')?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && onImportConfig) {
          onImportConfig(e.target.files[0]);
      }
  };

  if (type === 'template') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-800">模板定义</h2>
                <p className="text-slate-500 text-sm">定义输出 Excel 的结构。请在描述中包含别名以便匹配。</p>
            </div>
            {!isTemplateConfirmed && (
                 <div className="flex gap-2">
                     <button 
                       onClick={handleExport}
                       className="text-xs px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1 transition-colors"
                     >
                       <Download size={12} /> 导出配置
                     </button>
                     <button 
                       onClick={handleImportClick}
                       className="text-xs px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1 transition-colors"
                     >
                       <Upload size={12} /> 导入配置
                     </button>
                     <input 
                        type="file" 
                        id="configInput" 
                        className="hidden" 
                        accept=".json"
                        onChange={handleFileChange} 
                     />
                 </div>
            )}
        </div>
        
        {!isTemplateConfirmed && (
            <div className="flex justify-between items-center mb-4 bg-slate-50 p-2 rounded-lg">
                 <span className="text-sm text-slate-500 ml-2">已选择 {templateColumns.filter(c => c.selected).length} / {templateColumns.length} 列</span>
                 <div className="space-x-2">
                    <button 
                    onClick={() => onToggleAll?.(true)}
                    className="text-xs px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                    >
                    全选
                    </button>
                    <button 
                    onClick={() => onToggleAll?.(false)}
                    className="text-xs px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                    >
                    全不选
                    </button>
                 </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {templateColumns.map((col) => (
            <div 
              key={col.index} 
              className={`p-4 rounded-lg border flex items-start gap-4 transition-all ${col.selected ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-200 opacity-60'}`}
            >
              <input
                type="checkbox"
                checked={col.selected}
                disabled={isTemplateConfirmed}
                onChange={() => onToggleColumn?.(col.index)}
                className="mt-1.5 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">{col.originalHeader}</h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">列 {String.fromCharCode(65 + col.index)}</span>
                </div>
                
                {editingIndex === col.index ? (
                    <div className="mt-2 p-3 bg-white rounded border border-indigo-100 shadow-inner space-y-2">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">描述 (请在此处包含同义词或别名):</label>
                            <textarea 
                                className="w-full text-sm border rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[60px]"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                placeholder="描述该列含义，并列出可能的别名。例如：客户电话，也可能是'手机'或'联系方式'。"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingIndex(null)} className="text-xs text-slate-500 hover:text-slate-700">取消</button>
                            <button onClick={() => saveEditing(col.index)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors">确认修改</button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-1 group relative">
                        <p className="text-sm text-slate-500 pr-8 leading-relaxed">{col.description}</p>
                        {!isTemplateConfirmed && (
                            <button 
                                onClick={() => startEditing(col)}
                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-1"
                            >
                                <Edit2 size={14} />
                            </button>
                        )}
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isTemplateConfirmed && (
          <div className="pt-6 border-t border-slate-100 mt-4">
            <button
              onClick={onConfirmTemplate}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} />
              确认模板结构并锁定
            </button>
          </div>
        )}
         {isTemplateConfirmed && (
          <div className="pt-6 border-t border-slate-100 mt-4 text-center">
            <p className="text-green-600 font-medium flex items-center justify-center gap-2 bg-green-50 py-2 rounded-lg border border-green-100">
                <Check size={18} /> 模板结构已锁定，现在可以上传片段文件
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fragment View
  if (!fragmentFile) return <div className="text-center text-slate-400 mt-10">请选择左侧的文件进行预览</div>;

  const getMappingStatus = (mappingIdx: number) => {
     if (mappingIdx === -1) return { icon: <XCircle size={16} />, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
     return { icon: <Check size={16} />, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex justify-between items-start">
        <div>
            <h2 className="text-xl font-semibold text-slate-800">匹配状态: {fragmentFile.name}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                <span>智能匹配结果回顾</span>
                {fragmentFile.headerRowIndex !== undefined && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
                        自动识别表头行: 第 {fragmentFile.headerRowIndex + 1} 行
                    </span>
                )}
            </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
            fragmentFile.status === 'success' ? 'bg-green-100 text-green-700 border-green-200' : 
            fragmentFile.status === 'warning' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200'
        }`}>
            {fragmentFile.status === 'success' ? '匹配完美' : fragmentFile.status === 'warning' ? '部分缺失' : '匹配失败'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        <div className="grid grid-cols-12 gap-4 pb-2 border-b text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">模板列</div>
            <div className="col-span-1 text-center"></div>
            <div className="col-span-6">片段文件匹配列 (可手动修改)</div>
        </div>
        
        {templateColumns.filter(tc => tc.selected).map((tc) => {
            const mapping = fragmentFile.mappings.find(m => m.templateHeader === tc.originalHeader);
            const fragIndex = mapping?.fragmentIndex ?? -1;
            const status = getMappingStatus(fragIndex);

            return (
                <div key={tc.index} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-md border transition-all ${status.border} ${status.bg} hover:shadow-sm`}>
                    <div className="col-span-5 text-sm font-medium text-slate-700 truncate" title={tc.originalHeader}>
                        {tc.originalHeader}
                        <span className="block text-[10px] text-slate-400 font-normal truncate mt-0.5" title={tc.description}>
                          {tc.description}
                        </span>
                    </div>
                    <div className="col-span-1 flex justify-center text-slate-400">
                        <ArrowRight size={14} />
                    </div>
                    <div className="col-span-6 relative group">
                        <select 
                            className={`w-full text-sm bg-transparent border-none focus:ring-0 cursor-pointer appearance-none pr-8 ${fragIndex === -1 ? 'text-slate-400 italic' : 'text-slate-700 font-medium'}`}
                            value={fragIndex}
                            onChange={(e) => onUpdateMapping?.(fragmentFile.id, tc.originalHeader, parseInt(e.target.value))}
                        >
                            <option value="-1">-- 未匹配 (自动搜索失败) --</option>
                            {fragmentHeaders.map((header, idx) => (
                                <option key={idx} value={idx}>
                                    {String.fromCharCode(65 + idx)} 列: {header}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                            <span className={`${status.color}`}>{status.icon}</span>
                            <ChevronDown size={14} className="text-slate-300" />
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
      <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            <AlertTriangle size={12} className="inline mr-1 text-amber-500" /> 
            提示：如果 AI 自动映射错误，您可以直接点击上方的下拉框手动指定列。手动修改会自动保存并应用到最终汇总中。
          </p>
      </div>
    </div>
  );
};