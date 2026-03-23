declare module 'read-excel-file' {
  type CellValue = string | number | boolean | Date | null;
  type Row = CellValue[];
  export default function readXlsxFile(file: File | Blob): Promise<Row[]>;
}
