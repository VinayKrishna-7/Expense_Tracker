import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useToastStore } from '../../store/useToastStore';
import { parseCSV, CSVParseResult } from '../../utils/csvHelper';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categories = useCategoryStore((s) => s.categories);
  const importTransactions = useTransactionStore((s) => s.importTransactions);
  const addToast = useToastStore((s) => s.addToast);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (uploadedFile: File) => {
    if (!uploadedFile.name.endsWith('.csv')) {
      addToast({
        message: 'Please upload a valid .csv file format',
        type: 'error',
      });
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text, categories);
      setParseResult(result);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      addToast({ message: 'Failed to read the file', type: 'error' });
      setIsProcessing(false);
    };
    reader.readAsText(uploadedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.valid.length === 0) return;

    const count = importTransactions(parseResult.valid);
    addToast({
      message: `Successfully imported ${count} transactions!`,
      type: 'success',
    });
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Import Transactions via CSV"
      description="Upload your bank statement or expense CSV file to batch import transactions."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {!file ? (
          /* Dropzone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40'
                : 'border-surface-200 dark:border-surface-800 hover:border-brand-400 bg-surface-50/50 dark:bg-surface-900/50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <div className="mx-auto w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-bold text-surface-800 dark:text-surface-100">
              Click to select or drag and drop CSV
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Supports standard column headers: Date, Title, Type, Category, Amount, Payment Method
            </p>
          </div>
        ) : (
          /* File Preview & Validation Diagnostics */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 dark:bg-surface-800">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-brand-500" />
                <div>
                  <p className="text-xs font-bold text-surface-900 dark:text-white truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-surface-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded-md text-surface-400 hover:text-rose-500 transition-colors"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>

            {parseResult && (
              <>
                {/* Status Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <div>
                      <p className="text-sm font-extrabold">
                        {parseResult.valid.length}
                      </p>
                      <p className="text-[11px] font-medium">Valid records ready</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/50 text-amber-800 dark:text-amber-200">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <div>
                      <p className="text-sm font-extrabold">
                        {parseResult.invalid.length}
                      </p>
                      <p className="text-[11px] font-medium">Invalid rows skipped</p>
                    </div>
                  </div>
                </div>

                {/* Preview sample valid rows */}
                {parseResult.valid.length > 0 && (
                  <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden">
                    <div className="bg-surface-50 dark:bg-surface-800/60 px-3 py-2 text-xs font-bold text-surface-700 dark:text-surface-300 border-b border-surface-200 dark:border-surface-800">
                      Previewing sample entries (First {Math.min(4, parseResult.valid.length)})
                    </div>
                    <div className="max-h-40 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800 text-xs">
                      {parseResult.valid.slice(0, 4).map((row, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 flex items-center justify-between"
                        >
                          <div className="truncate mr-2">
                            <span className="font-semibold text-surface-900 dark:text-white">
                              {row.title}
                            </span>
                            <span className="text-surface-400 ml-2">
                              {row.date}
                            </span>
                          </div>
                          <span
                            className={clsx(
                              'font-bold shrink-0',
                              row.type === 'expense'
                                ? 'text-rose-500'
                                : 'text-emerald-500'
                            )}
                          >
                            {row.type === 'expense' ? '-' : '+'}
                            {row.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show invalid row error details if any */}
                {parseResult.invalid.length > 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-rose-700 dark:text-rose-300">
                      Validation warnings:
                    </p>
                    {parseResult.invalid.slice(0, 3).map((inv, idx) => (
                      <p key={idx} className="text-rose-600 dark:text-rose-400">
                        Row {inv.row}: {inv.error}
                      </p>
                    ))}
                    {parseResult.invalid.length > 3 && (
                      <p className="text-rose-500 italic">
                        ...and {parseResult.invalid.length - 3} more invalid rows.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100 dark:border-surface-800">
          <Button
            variant="secondary"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!parseResult || parseResult.valid.length === 0 || isProcessing}
            onClick={handleConfirmImport}
          >
            Import {parseResult?.valid.length || 0} Transactions
          </Button>
        </div>
      </div>
    </Modal>
  );
};
