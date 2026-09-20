import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Check,
  UploadCloud,
  DownloadCloud,
  HelpCircle,
  Settings,
  Sparkles,
  Table,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  testGoogleSheetsConnection,
  fetchAllScoresFromSheets,
  batchSyncAllToSheets,
  initAllClassSheetsInGoogleSheets,
} from '../services/googleSheetsService';
import { ClassItem } from '../types';
import { getSubjectsForClass } from '../data/curriculumSubjects';
import { findTeachersForSubjectAndClass } from '../data/teacherSubjectsDatabase';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  onSaveWebAppUrl: (url: string) => void;
  isAutoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  students: Array<{
    id: string;
    name: string;
    nisn: string;
    classId?: string;
    scores: Record<string, number>;
  }>;
  classes?: ClassItem[];
  onApplyScoresFromSheets: (studentsScores: Record<string, Record<string, number>>) => void;
  lastSyncTime?: string;
  isAdmin?: boolean;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  webAppUrl,
  onSaveWebAppUrl,
  isAutoSyncEnabled,
  onToggleAutoSync,
  students,
  classes = [],
  onApplyScoresFromSheets,
  lastSyncTime,
  isAdmin = false,
}) => {
  const [urlInput, setUrlInput] = useState(webAppUrl);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isInitializingSheets, setIsInitializingSheets] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'tutorial' | 'script'>('settings');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestingStatus('error');
      setStatusMessage('Silakan masukkan URL Web App Google Apps Script terlebih dahulu.');
      return;
    }

    setTestingStatus('loading');
    setStatusMessage('Menghubungkan ke Google Spreadsheet...');

    const res = await testGoogleSheetsConnection(urlInput);
    if (res.success) {
      setTestingStatus('success');
      setStatusMessage(res.message);
      onSaveWebAppUrl(urlInput.trim());
    } else {
      setTestingStatus('error');
      setStatusMessage(res.message);
    }
  };

  const handleSaveUrl = () => {
    onSaveWebAppUrl(urlInput.trim());
    handleTestConnection();
  };

  const handlePullData = async () => {
    if (!urlInput.trim()) {
      alert('URL Web App Google Sheets belum diatur.');
      return;
    }

    setIsPulling(true);
    try {
      const res = await fetchAllScoresFromSheets(urlInput);
      if (res.success && res.studentsScores) {
        onApplyScoresFromSheets(res.studentsScores);
        alert(`Berhasil menarik nilai dari Google Spreadsheet! (${res.rowCount || 0} baris nilai dimuat)`);
      } else {
        alert(res.message || 'Gagal menarik data dari Google Spreadsheet');
      }
    } catch (e: any) {
      alert(`Error saat menarik data: ${e.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handlePushData = async () => {
    if (!urlInput.trim()) {
      alert('URL Web App Google Sheets belum diatur.');
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin mengunggah seluruh nilai dari ${students.length} santri ke Google Spreadsheet?\n\n` +
          `Data nilai akan dimasukkan ke masing-masing Sheet Rekap Kelas (Rekap_1A, Rekap_1B, dst.) lengkap dengan nama santri dan guru, serta memperbarui Sheet Dashboard_Monitoring.`
      )
    ) {
      return;
    }

    setIsPushing(true);
    try {
      const payload = (classes || []).map((cls) => {
        const classSubjects = getSubjectsForClass(cls.id).map((sub) => ({
          id: sub.id,
          nameId: sub.nameId,
          teacherName: findTeachersForSubjectAndClass(sub.nameId, cls.nameLatin).join(', ') || '-',
        }));

        const classStudents = students
          .filter((s) => s.classId === cls.id)
          .map((s) => ({
            id: s.id,
            name: s.name,
            nisn: s.nisn || '',
            scores: s.scores,
          }));

        return {
          id: cls.id,
          nameLatin: cls.nameLatin,
          waliKelasName: cls.waliKelasName,
          students: classStudents,
          subjects: classSubjects,
        };
      });

      const res = await initAllClassSheetsInGoogleSheets(urlInput, payload);
      await batchSyncAllToSheets(urlInput, students);

      if (res.success) {
        alert(`✅ Berhasil mengunggah seluruh nilai santri ke sheet masing-masing kelas dan Dashboard_Monitoring!`);
      } else {
        alert(res.message || 'Gagal mengunggah nilai ke Google Spreadsheet');
      }
    } catch (e: any) {
      alert(`Error saat mengunggah data: ${e.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  const handleInitAllSheets = async () => {
    if (!urlInput.trim()) {
      alert('URL Web App Google Sheets belum diatur.');
      return;
    }

    const classCount = classes?.length || 0;
    if (
      !confirm(
        `Apakah Anda ingin membuat ${classCount} Sheet Rekap Kelas beserta Sheet "Dashboard_Monitoring" di Google Spreadsheet?\n\n` +
          `• Setiap kelas akan dibuatkan sheet rapi (contoh: Rekap_1A, Rekap_1B, dst.) lengkap dengan Kop Resmi Pesantren Al-Ghozali, NISN, nama santri, kolom mata pelajaran, dan nama guru pengampu.\n` +
          `• Sheet "Dashboard_Monitoring" otomatis menampilkan seluruh mata pelajaran, guru pengampu, total santri, dan status pengisian nilai.\n\n` +
          `Klik OK untuk melanjutkan proses inisialisasi.`
      )
    ) {
      return;
    }

    setIsInitializingSheets(true);
    try {
      const payload = (classes || []).map((cls) => {
        const classSubjects = getSubjectsForClass(cls.id).map((sub) => ({
          id: sub.id,
          nameId: sub.nameId,
          teacherName: findTeachersForSubjectAndClass(sub.nameId, cls.nameLatin).join(', ') || '-',
        }));

        const classStudents = students
          .filter((s) => s.classId === cls.id)
          .map((s) => ({
            id: s.id,
            name: s.name,
            nisn: s.nisn || '',
            scores: s.scores,
          }));

        return {
          id: cls.id,
          nameLatin: cls.nameLatin,
          waliKelasName: cls.waliKelasName,
          students: classStudents,
          subjects: classSubjects,
        };
      });

      const res = await initAllClassSheetsInGoogleSheets(urlInput, payload);
      if (res.success) {
        alert(
          `✅ Berhasil! Seluruh ${classCount} sheet rekap kelas dan Dashboard_Monitoring telah berhasil dibuat di Google Spreadsheet Anda!`
        );
      } else {
        alert(res.message || 'Gagal menginisialisasi spreadsheet');
      }
    } catch (e: any) {
      alert(`Error saat inisialisasi: ${e.message || String(e)}`);
    } finally {
      setIsInitializingSheets(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Cloud size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Koneksi Google Spreadsheet</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-medium">
                  Multi-Device Sync
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                Sinkronkan nilai santri secara real-time ke semua perangkat guru & admin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-emerald-200/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs - Only shown for Admin */}
        {isAdmin && (
          <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'settings'
                  ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Settings size={15} />
              <span>Pengaturan & Sinkronisasi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tutorial')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'tutorial'
                  ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <HelpCircle size={15} />
              <span>Panduan Pasang (2 Menit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'script'
                  ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Table size={15} />
              <span>Kode Google Apps Script</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* TAB 1: PENGATURAN & SINKRONISASI */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Status Koneksi Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                testingStatus === 'success' || (webAppUrl && testingStatus === 'idle')
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : testingStatus === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}>
                <div className="mt-0.5">
                  {testingStatus === 'loading' ? (
                    <RefreshCw size={18} className="animate-spin text-emerald-600" />
                  ) : testingStatus === 'success' || (webAppUrl && testingStatus === 'idle') ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : testingStatus === 'error' ? (
                    <AlertCircle size={18} className="text-rose-600" />
                  ) : (
                    <Cloud size={18} className="text-stone-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {testingStatus === 'loading'
                      ? 'Sedang menguji koneksi...'
                      : testingStatus === 'success' || (webAppUrl && testingStatus === 'idle')
                      ? 'Terhubung ke Google Spreadsheet'
                      : testingStatus === 'error'
                      ? 'Koneksi Gagal'
                      : 'Belum Terhubung ke Google Spreadsheet'}
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">
                    {statusMessage || (webAppUrl
                      ? 'Nilai yang diinput otomatis tersimpan ke cloud dan dapat dibuka di semua perangkat.'
                      : 'Masukkan URL Web App Google Apps Script Anda untuk memulai sinkronisasi.')}
                  </p>
                  {lastSyncTime && (
                    <div className="text-[11px] text-stone-500 mt-1">
                      Terakhir tersinkron: <span className="font-semibold">{lastSyncTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Input - Only Admin can configure or edit */}
              {isAdmin ? (
                <div className="space-y-2">
                  <label className="font-bold text-stone-800 block">
                    Google Apps Script Web App URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-stone-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testingStatus === 'loading'}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-xs"
                    >
                      {testingStatus === 'loading' ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      <span>Tes Koneksi</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveUrl}
                      className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition shrink-0"
                    >
                      Simpan
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Dapatkan URL ini dari menu <strong>Deploy &gt; New deployment &gt; Web app</strong> di Google Sheets Anda.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900 text-xs">Spreadsheet Pusat Pesantren Al-Ghozali</div>
                    <div className="text-[11px] text-emerald-700">
                      Dikelola langsung oleh Administrator. Nilai yang Anda simpan otomatis terhubung ke cloud.
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shrink-0">
                    Otomatis Aktif
                  </span>
                </div>
              )}

              {/* Auto Sync Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <div className="font-bold text-stone-800 text-xs">Otomatis Simpan ke Spreadsheet (Real-time Auto-Sync)</div>
                  <div className="text-[11px] text-stone-500">
                    Setiap guru mengubah nilai di form atau tabel, nilai otomatis dikirim ke Google Sheets di latar belakang.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAutoSyncEnabled}
                    onChange={(e) => onToggleAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Manual Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-stone-800 text-xs uppercase tracking-wider">Aksi Sinkronisasi Manual:</div>
                <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-2' : ''} gap-3`}>
                  
                  {/* Tarik Data (Pull) - Available for all */}
                  <div className="border border-stone-200 rounded-xl p-3.5 bg-white hover:border-emerald-300 transition flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                        <DownloadCloud size={16} className="text-emerald-600" />
                        <span>Tarik Nilai dari Spreadsheet (Pull)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mb-3">
                        Perbarui aplikasi di perangkat ini dengan nilai-nilai terbaru yang telah diinput oleh guru lain di Google Sheets.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePullData}
                      disabled={isPulling || !webAppUrl}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      {isPulling ? <RefreshCw size={14} className="animate-spin" /> : <DownloadCloud size={14} />}
                      <span>{isPulling ? 'Menarik Nilai...' : 'Tarik Nilai Sekarang'}</span>
                    </button>
                  </div>

                  {/* Unggah Semua (Push) - Admin Only */}
                  {isAdmin && (
                    <div className="border border-stone-200 rounded-xl p-3.5 bg-white hover:border-emerald-300 transition flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                          <UploadCloud size={16} className="text-teal-600" />
                          <span>Unggah Semua Nilai (Push All)</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mb-3">
                          Kirim seluruh data nilai dari {students.length} santri saat ini untuk ditimpa ke Google Spreadsheet utama.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handlePushData}
                        disabled={isPushing || !webAppUrl}
                        className="w-full py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                      >
                        {isPushing ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                        <span>{isPushing ? 'Mengunggah...' : 'Unggah Semua Nilai'}</span>
                      </button>
                    </div>
                  )}

                  {/* Inisialisasi Seluruh Sheet Rekap Kelas & Monitoring - Admin Only */}
                  {isAdmin && (
                    <div className="sm:col-span-2 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 rounded-xl p-4 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                              <LayoutDashboard size={16} />
                            </div>
                            <span>Inisialisasi Seluruh Sheet Rekap Kelas & Dashboard Monitoring</span>
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                              Khusus Admin
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 max-w-xl">
                            Membuat otomatis sheet rekap untuk <strong>seluruh kelas ({classes.length} kelas)</strong> lengkap dengan format resmi pesantren (Kop Resmi Al-Ghozali, NISN, Nama Santri, kolom mata pelajaran & nama guru pengampu) serta sheet <strong>Dashboard_Monitoring</strong> untuk memantau status kelengkapan nilai guru secara real-time.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleInitAllSheets}
                          disabled={isInitializingSheets || !webAppUrl}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-md hover:shadow-lg"
                        >
                          {isInitializingSheets ? (
                            <RefreshCw size={16} className="animate-spin text-emerald-200" />
                          ) : (
                            <Layers size={16} className="text-emerald-200" />
                          )}
                          <span>{isInitializingSheets ? 'Sedang Menyiapkan...' : 'Buat Format Rekap & Monitoring'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PANDUAN CEPAT (2 MENIT) */}
          {activeTab === 'tutorial' && (
            <div className="space-y-4 text-stone-700 leading-relaxed">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900">
                <p className="font-bold">Hanya perlu 1 kali pembuatan di Google Spreadsheet utama pesantren.</p>
                <p className="text-[11px] mt-0.5">Setelah dibuat, semua guru cukup memasukkan URL yang sama di perangkat masing-masing.</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-stone-900 block">Buat Google Spreadsheet Baru</strong>
                    Buka Google Drive atau ketik <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold inline-flex items-center gap-0.5">sheets.new <ExternalLink size={11} /></a> di browser Anda. Beri nama misalnya <em>"Raport Pondok Al-Ghozali 2025/2026"</em>.
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-stone-900 block">Buka Editor Apps Script</strong>
                    Di menu atas Google Spreadsheet, klik <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-stone-900 block">Tempelkan Kode Skrip</strong>
                    Hapus semua tulisan di editor Apps Script (misal: <code>myFunction()</code>), lalu salin kode dari tab <strong>"Kode Google Apps Script"</strong> dan tempelkan ke sana. Klik ikon Disket (Simpan).
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div>
                    <strong className="text-stone-900 block">Deploy sebagai Web App</strong>
                    Klik tombol <strong>Deploy (Terapkan)</strong> di pojok kanan atas &gt; pilih <strong>New deployment (Deployment baru)</strong>.
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-600 pl-1">
                      <li>Pilih jenis: <strong>Web app (Aplikasi web)</strong> (ikon bola dunia)</li>
                      <li>Description: <code>Raport Sync API</code></li>
                      <li>Execute as: <strong>Me</strong> (email Google Anda)</li>
                      <li>Who has access: <strong className="text-emerald-700">Anyone (Siapa saja)</strong> <span className="text-rose-600 font-bold">*Wajib pilih ini agar guru bisa kirim nilai</span></li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    5
                  </div>
                  <div>
                    <strong className="text-stone-900 block">Izinkan Akses & Salin Web App URL</strong>
                    Klik <strong>Deploy</strong>, lalu jika Google meminta izin akun, klik <em>Advanced / Lanjutan</em> &gt; <em>Go to Untitled project (unsafe)</em> &gt; <em>Allow</em>.
                    <br />
                    Salin <strong>Web app URL</strong> yang berakhiran <code>/exec</code>, lalu tempelkan ke tab <strong>Pengaturan</strong> di aplikasi ini dan klik <strong>Tes Koneksi</strong>. Selesai!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KODE APPS SCRIPT */}
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-stone-600">
                  Salin seluruh kode JavaScript di bawah ini dan tempelkan ke menu <strong>Extensions &gt; Apps Script</strong> di Google Sheets Anda:
                </p>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition shadow-xs"
                >
                  {copiedScript ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  <span>{copiedScript ? 'Tersalin!' : 'Salin Semua Kode'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-stone-900 text-emerald-300 rounded-xl overflow-x-auto text-[11px] font-mono max-h-[340px] border border-stone-800">
                  <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500">
            {webAppUrl ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> URL Tersimpan
              </span>
            ) : (
              <span>Belum ada URL yang disimpan</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
