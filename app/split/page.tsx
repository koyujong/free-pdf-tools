'use client';

import React, { useState, useCallback, DragEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { UploadCloud, FileText, Download, ArrowLeft, Loader2, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';
import CountdownOverlay from '../../components/CountdownOverlay';

export default function SplitPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [pendingDownload, setPendingDownload] = useState<{ blob: Blob; filename: string } | null>(null);
    const { t } = useLanguage();

    // 분리 옵션: 추출할 페이지 입력 (예: "1, 3, 5-7")
    const [pageRange, setPageRange] = useState<string>('');

    // 1. 파일 업로드 및 전체 페이지 수 로드
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            loadFileData(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            loadFileData(e.target.files[0]);
        }
    };

    const loadFileData = async (uploadedFile: File) => {
        if (uploadedFile.type !== 'application/pdf') {
            toast.error(t.split_error_not_pdf);
            return;
        }

        try {
            const arrayBuffer = await uploadedFile.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            setTotalPages(pdf.getPageCount());
            setFile(uploadedFile);
            toast.success(t.split_success_loaded);
        } catch (error) {
            console.error(error);
            toast.error(t.toast_upload_fail);
        }
    };

    // 2. 사용자가 입력한 문자열(예: '1, 3, 5-7')을 페이지 배열로 변환하는 유틸리티
    const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
        if (!rangeStr.trim()) {
            // 입력이 없으면 전체 페이지를 개별로 분리하는 것으로 간주
            return Array.from({ length: maxPages }, (_, i) => i);
        }

        const pages = new Set<number>();
        const parts = rangeStr.split(',').map(p => p.trim());

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(num => parseInt(num, 10));
                if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > maxPages) {
                    throw new Error(t.split_error_invalid_range);
                }
                for (let i = start; i <= end; i++) {
                    pages.add(i - 1); // pdf-lib은 0부터 시작하므로 -1 처리
                }
            } else {
                const page = parseInt(part, 10);
                if (isNaN(page) || page < 1 || page > maxPages) {
                    throw new Error(t.split_error_invalid_page);
                }
                pages.add(page - 1);
            }
        }

        return Array.from(pages).sort((a, b) => a - b);
    };

    // 3. ✨ 핵심: pdf-lib으로 페이지 분리 후 JSZip으로 압축
    const splitPdf = async () => {
        if (!file) return;

        setIsProcessing(true);
        const toastId = toast.loading(t.split_loading);

        try {
            // 1. 페이지 인덱스 파싱
            const pageIndicesToExtract = parsePageRange(pageRange, totalPages);
            if (pageIndicesToExtract.length === 0) throw new Error(t.split_error_no_page);

            // 2. 원본 PDF 로드
            const arrayBuffer = await file.arrayBuffer();
            const originalPdf = await PDFDocument.load(arrayBuffer);

            const zip = new JSZip();

            // 3. 각 페이지를 개별 PDF로 분리하여 ZIP 안에 추가
            for (const [idx, pageIndex] of pageIndicesToExtract.entries()) {
                const newDoc = await PDFDocument.create();
                const [copiedPage] = await newDoc.copyPages(originalPdf, [pageIndex]);
                newDoc.addPage(copiedPage);

                const pdfBytes = await newDoc.save();
                // 원본 파일명 기반으로 저장할 파일명 생성
                const baseName = file.name.replace('.pdf', '');
                const fileName = `${baseName}_page_${pageIndex + 1}.pdf`;

                zip.file(fileName, pdfBytes);
            }

            // 4. 단일 파일이면 바로 다운로드, 여러 파일이면 ZIP으로 다운로드
            if (pageIndicesToExtract.length === 1) {
                const singleFileContent = await zip.file(Object.keys(zip.files)[0])?.async('blob');
                if (singleFileContent) {
                    toast.dismiss(toastId);
                    setPendingDownload({ blob: singleFileContent, filename: Object.keys(zip.files)[0] });
                    setShowCountdown(true);
                }
            } else {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                toast.dismiss(toastId);
                setPendingDownload({ blob: zipBlob, filename: `${file.name.replace('.pdf', '')}_split.zip` });
                setShowCountdown(true);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t.toast_upload_fail, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    // 4. 범용 Blob 다운로드 헬퍼
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCountdownComplete = useCallback(() => {
        if (pendingDownload) {
            downloadBlob(pendingDownload.blob, pendingDownload.filename);
            setPendingDownload(null);
            toast.success(t.split_success);
        }
        setShowCountdown(false);
    }, [pendingDownload, t.split_success]);


    return (
        <div className="max-w-4xl mx-auto px-4 pt-8">
            {/* 헤더 */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t.split_title}</h1>
                    <p className="text-gray-500 mt-1">{t.split_subtitle}</p>
                </div>
            </div>

            <AdPlaceholder position="top" />

            <div className="grid md:grid-cols-[1fr_300px] gap-8">
                {/* 중앙: 파일 업로드 및 정보 */}
                <div className="flex flex-col gap-6">

                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[300px] ${isDragging ? 'border-rose-500 bg-rose-50 scale-[1.02]' : 'border-gray-300 bg-white hover:border-rose-400 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                accept="application/pdf"
                                className="hidden"
                                onChange={handleFileInput}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
                                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6 text-rose-500">
                                    <UploadCloud className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{t.split_drag_drop}</h3>
                                <p className="text-gray-500">{t.split_drag_drop_sub}</p>
                            </label>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center min-h-[300px] justify-center relative overflow-hidden">
                            {/* 배경 장식 */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10 opacity-50"></div>

                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4 text-rose-600">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 max-w-[80%] truncate">{file.name}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-6 bg-gray-100 px-3 py-1 rounded-full">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {t.split_total_pages} {totalPages}
                            </p>

                            <button
                                onClick={() => { setFile(null); setPageRange(''); }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                {t.split_change_file}
                            </button>
                        </div>
                    )}

                    <AdPlaceholder position="mid" className="p-4 bg-rose-50/10 border-rose-100/50" />
                </div>

                {/* 우측 사이드바: 옵션 설정 및 실행 */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-rose-500" />
                            {t.split_options}
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.split_range_label}
                            </label>
                            <input
                                type="text"
                                value={pageRange}
                                onChange={(e) => setPageRange(e.target.value)}
                                placeholder={t.split_range_placeholder}
                                disabled={!file}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                            />
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                {t.split_range_hint}
                            </p>
                        </div>

                        <button
                            onClick={splitPdf}
                            disabled={!file || isProcessing}
                            className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${!file
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t.merge_processing}
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    {t.split_button}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <AdPlaceholder />

            {showCountdown && (
                <CountdownOverlay
                    duration={10}
                    onComplete={handleCountdownComplete}
                />
            )}
        </div>
    );
}
