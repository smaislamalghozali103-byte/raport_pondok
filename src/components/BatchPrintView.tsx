import React from 'react';
import { Subject, CalculatedStudent, SchoolConfig, ClassItem } from '../types';
import { ReportDesignConfig } from '../data/reportDesign';
import { ReportCertificate } from './ReportCertificate';
import { Printer, X, Eye } from 'lucide-react';

interface BatchPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  students: CalculatedStudent[];
  subjects: Subject[];
  config: SchoolConfig;
  classes?: ClassItem[];
  rangeStart: number;
  rangeEnd: number;
  designConfig?: ReportDesignConfig;
  customSubjectOverrides?: Record<string, { nameAr?: string; nameId?: string; customTerbilang?: string }>;
}

export const BatchPrintView: React.FC<BatchPrintViewProps> = ({
  isOpen,
  onClose,
  students,
  subjects,
  config,
  classes,
  rangeStart,
  rangeEnd,
  designConfig,
  customSubjectOverrides,
}) => {
  if (!isOpen) return null;

  const selectedStudents = students.filter(
    (s, idx) => idx + 1 >= rangeStart && idx + 1 <= rangeEnd
  );

  const handlePrintNow = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/90 backdrop-blur-sm overflow-y-auto print:static print:bg-white print:overflow-visible print:p-0">
      
      <style>{`
        @media print {
          @page {
            size: 210mm 330mm;
            margin: 0 !important;
          }

          .no-print, header, footer, nav, div[sticky], .fixed {
            display: none !important;
          }

          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-batch-container {
            background-color: #ffffff !important;
            padding: 0 !important;
            display: block !important;
          }

          .rapor-print-item {
            page-break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            display: block !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 210mm !important;
            height: 330mm !important; 
            box-sizing: border-box !important;
          }

          .rapor-print-item:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

      {/* Top Floating Control Bar */}
      <div className="no-print sticky top-0 z-50 bg-stone-900 border-b border-stone-800 text-white px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Eye className="text-emerald-400" size={20} />
          <div>
            <h3 className="font-bold text-sm">
              Pratinjau Cetak Masal ({selectedStudents.length} Raport Santri)
            </h3>
            <p className="text-xs text-stone-400">
              Rentang No. {rangeStart} s/d {rangeEnd} • Masing-masing santri akan tercetak 1 lembar F4 (Folio)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrintNow}
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2 px-5 rounded-lg shadow-lg text-xs tracking-wider"
          >
            <Printer size={15} />
            CETAK SEKARANG ({selectedStudents.length} LEMBAR)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Printable Area containing all certificates */}
      <div className="print-batch-container flex-1 p-4 md:p-8 space-y-12 bg-stone-800/40 print:bg-white print:p-0 print:space-y-0">
        {selectedStudents.map((std, i) => (
          <div key={std.id} className="rapor-print-item relative">
            <div className="no-print max-w-[820px] mx-auto mb-2 text-xs font-semibold text-emerald-300 flex justify-between items-center px-2">
              <span>Lembar {i + 1} dari {selectedStudents.length}</span>
              <span>Santri: {std.name} (NISN: {std.nisn || '-'})</span>
            </div>

            <ReportCertificate
              student={std}
              subjects={subjects}
              config={config}
              classes={classes}
              designConfig={designConfig}
              customSubjectOverrides={customSubjectOverrides}
              isPrintOnly={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
