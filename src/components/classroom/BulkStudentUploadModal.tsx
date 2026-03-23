import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileSpreadsheet, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';

interface ParsedStudent {
  firstName: string;
  lastName: string;
}

interface BulkStudentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCode: string;
}

const BulkStudentUploadModal: React.FC<BulkStudentUploadModalProps> = ({
  open, onOpenChange, inviteCode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkText, setBulkText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [processing, setProcessing] = useState(false);

  const parseCSVText = (text: string): ParsedStudent[] => {
    return text.split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { firstName: parts[0] || '', lastName: parts[1] || '' };
      })
      .filter(s => s.firstName);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setFileName(file.name);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'csv') {
        const text = await file.text();
        const students = parseCSVText(text);
        setParsedStudents(students);
        setBulkText(students.map(s => `${s.firstName}, ${s.lastName}`).join('\n'));
      } else if (ext === 'xlsx' || ext === 'xls') {
        const rows = await readXlsxFile(file);

        const startIdx = rows.length > 0 && typeof rows[0][0] === 'string' &&
          (rows[0][0] as string).toLowerCase().includes('name') ? 1 : 0;

        const students = rows.slice(startIdx)
          .filter(row => row.length > 0 && row[0])
          .map(row => ({
            firstName: String(row[0] || '').trim(),
            lastName: String(row[1] || '').trim(),
          }));

        setParsedStudents(students);
        setBulkText(students.map(s => `${s.firstName}, ${s.lastName}`).join('\n'));
      } else {
        toast.error('Unsupported file type. Please use CSV or Excel (.xlsx/.xls)');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      toast.error('Failed to parse file');
    }
    setProcessing(false);
  };

  const handleTextChange = (text: string) => {
    setBulkText(text);
    setParsedStudents(parseCSVText(text));
  };

  const handleConfirm = () => {
    if (parsedStudents.length === 0) return;
    toast.success(
      `${parsedStudents.length} students added to roster. Share invite code "${inviteCode}" for them to join.`
    );
    resetAndClose();
  };

  const resetAndClose = () => {
    setBulkText('');
    setFileName('');
    setParsedStudents([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Upload Students</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file, or paste student names manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              {processing ? (
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
              ) : fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6"
                    onClick={e => { e.stopPropagation(); setFileName(''); setParsedStudents([]); setBulkText(''); }}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload <strong>CSV</strong> or <strong>Excel</strong> file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected columns: FirstName, LastName
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Or paste manually */}
          <div className="space-y-2">
            <Label>Or Paste Student Names</Label>
            <Textarea
              placeholder={`Ama, Mensah\nKofi, Asante\nAbena, Darko`}
              value={bulkText}
              onChange={e => handleTextChange(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          {parsedStudents.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <strong>{parsedStudents.length}</strong> students detected
            </div>
          )}

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Students will need to sign up and use invite code{' '}
              <span className="font-mono font-bold">{inviteCode}</span> to join. This creates a roster for tracking.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={parsedStudents.length === 0}>
              <Upload className="w-4 h-4 mr-2" />
              Upload {parsedStudents.length} Students
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkStudentUploadModal;
