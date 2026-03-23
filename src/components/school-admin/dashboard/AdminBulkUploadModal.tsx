import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileSpreadsheet, Loader2, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';

interface ParsedTeacher {
  name: string;
  subject: string;
  email: string;
}

interface ParsedStudent {
  name: string;
  dateOfBirth: string;
  level: string;
}

interface AdminBulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadType: 'teacher' | 'student';
  onConfirm: (data: ParsedTeacher[] | ParsedStudent[]) => void;
}

const AdminBulkUploadModal: React.FC<AdminBulkUploadModalProps> = ({
  open, onOpenChange, uploadType, onConfirm
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkText, setBulkText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  const isTeacher = uploadType === 'teacher';

  const parseCSVText = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (isTeacher) {
      return lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { name: parts[0] || '', subject: parts[1] || '', email: parts[2] || '' };
      }).filter((t: ParsedTeacher) => t.name && t.email);
    } else {
      return lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { name: parts[0] || '', dateOfBirth: parts[1] || '', level: parts[2] || '' };
      }).filter((s: ParsedStudent) => s.name);
    }
  };

  const downloadSampleCSV = () => {
    let csvContent: string;
    let filename: string;

    if (isTeacher) {
      csvContent = 'Name,Subject,School Email\nAma Mensah,Mathematics,ama.mensah@school.edu.gh\nKofi Asante,English,kofi.asante@school.edu.gh\nAbena Darko,Science,abena.darko@school.edu.gh';
      filename = 'sample_teachers.csv';
    } else {
      csvContent = 'Name,Date of Birth,Level/Grade\nKwame Adjei,2010-03-15,JHS 1\nAfia Boateng,2009-11-22,JHS 2\nYaw Mensah,2010-07-08,JHS 1';
      filename = 'sample_students.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
        // Skip header row
        const lines = text.split('\n');
        const dataLines = lines.length > 1 && lines[0].toLowerCase().includes('name') 
          ? lines.slice(1).join('\n') : text;
        const data = parseCSVText(dataLines);
        setParsedData(data);
        setBulkText(data.map(d => isTeacher 
          ? `${(d as ParsedTeacher).name}, ${(d as ParsedTeacher).subject}, ${(d as ParsedTeacher).email}`
          : `${(d as ParsedStudent).name}, ${(d as ParsedStudent).dateOfBirth}, ${(d as ParsedStudent).level}`
        ).join('\n'));
      } else if (ext === 'xlsx' || ext === 'xls') {
        const rows = await readXlsxFile(file);

        const startIdx = rows.length > 0 && typeof rows[0][0] === 'string' &&
          (rows[0][0] as string).toLowerCase().includes('name') ? 1 : 0;

        const data = rows.slice(startIdx)
          .filter(row => row.length > 0 && row[0])
          .map(row => isTeacher
            ? { name: String(row[0] || '').trim(), subject: String(row[1] || '').trim(), email: String(row[2] || '').trim() }
            : { name: String(row[0] || '').trim(), dateOfBirth: String(row[1] || '').trim(), level: String(row[2] || '').trim() }
          );

        setParsedData(data);
        setBulkText(data.map(d => isTeacher
          ? `${(d as ParsedTeacher).name}, ${(d as ParsedTeacher).subject}, ${(d as ParsedTeacher).email}`
          : `${(d as ParsedStudent).name}, ${(d as ParsedStudent).dateOfBirth}, ${(d as ParsedStudent).level}`
        ).join('\n'));
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
    setParsedData(parseCSVText(text));
  };

  const handleConfirm = () => {
    if (parsedData.length === 0) return;
    onConfirm(parsedData);
    resetAndClose();
  };

  const resetAndClose = () => {
    setBulkText('');
    setFileName('');
    setParsedData([]);
    onOpenChange(false);
  };

  const placeholder = isTeacher
    ? 'Ama Mensah, Mathematics, ama@school.edu.gh\nKofi Asante, English, kofi@school.edu.gh'
    : 'Kwame Adjei, 2010-03-15, JHS 1\nAfia Boateng, 2009-11-22, JHS 2';

  const columnsLabel = isTeacher ? 'Name, Subject, School Email' : 'Name, Date of Birth, Level/Grade';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload {isTeacher ? 'Teachers' : 'Students'}</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file, or paste {isTeacher ? 'teacher' : 'student'} data manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Sample */}
          <Button variant="outline" size="sm" onClick={downloadSampleCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Download Sample CSV
          </Button>

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
                    onClick={e => { e.stopPropagation(); setFileName(''); setParsedData([]); setBulkText(''); }}>
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
                    Expected columns: {columnsLabel}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Manual paste */}
          <div className="space-y-2">
            <Label>Or Paste Data Manually</Label>
            <Textarea
              placeholder={placeholder}
              value={bulkText}
              onChange={e => handleTextChange(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Format: {columnsLabel}</p>
          </div>

          {parsedData.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <strong>{parsedData.length}</strong> {isTeacher ? 'teachers' : 'students'} detected
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={parsedData.length === 0}>
              <Upload className="w-4 h-4 mr-2" />
              Upload {parsedData.length} {isTeacher ? 'Teachers' : 'Students'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBulkUploadModal;
