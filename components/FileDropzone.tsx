import React, { useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  label: string;
  compact?: boolean;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  multiple = false,
  label,
  compact = false,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 bg-white dark:bg-[#111827] dark:border-slate-700/80'}
        ${compact ? 'p-4' : 'p-8'}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        multiple={multiple}
        accept=".xlsx, .xls"
        onChange={(e) => {
          if (e.target.files) onFilesSelected(Array.from(e.target.files));
        }}
      />
      <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3`}>
        {compact ? <Upload size={16} /> : <FileSpreadsheet size={24} />}
      </div>
      <p className={`font-medium ${compact ? 'text-sm' : 'text-base'} text-slate-600 dark:text-slate-300`}>{label}</p>
      {!compact && <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">拖拽或点击上传 (Drag & Drop)</p>}
    </div>
  );
};