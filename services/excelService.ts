import { ExcelRow } from '../types';

const getXLSX = () => {
  const X = window.XLSX;
  if (!X) throw new Error("SheetJS not loaded");
  return X;
};

export const readExcelPreview = async (file: File, rows = 100): Promise<any[][]> => {
  const XLSX = getXLSX();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Get generic array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, limit: rows });
        resolve(jsonData as any[][]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const readFullExcel = async (file: File): Promise<any[][]> => {
    const XLSX = getXLSX();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData as any[][]);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
};

export const generateMergedExcel = async (
  templateFile: File,
  mergedData: any[][]
) => {
  const XLSX = getXLSX();
  const arrayBuffer = await templateFile.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const currentData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const finalData = [...currentData, ...mergedData];

  const newSheet = XLSX.utils.aoa_to_sheet(finalData);
  workbook.Sheets[firstSheetName] = newSheet;

  XLSX.writeFile(workbook, `${templateFile.name.replace('.xlsx', '')}_汇总结果.xlsx`);
};