'use client';

import React, { useState, DragEvent } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { UploadCloud, FileText, Download, ArrowLeft, Loader2, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';

export default function RotatePdfPage() {
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // 회전 옵션
    const [rotationAngle, setRotationAngle] = useState<number>(90);
    const [pageRange, setPageRange] = useState<string>('');

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
            toast.error(t.rotate_error_not_pdf);
            return;
        }

        try {
            const arrayBuffer = await uploadedFile.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            setTotalPages(pdf.getPageCount());
            setFile(uploadedFile);
            toast.success(t.rotate_success_loaded);
        } catch (error) {
            console.error(error);
            toast.error(t.toast_upload_fail);
        }
    };

    const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
        if (!rangeStr.trim()) {
            return Array.from({ length: maxPages }, (_, i) => i);
        }

        const pages = new Set<number>();
        const parts = rangeStr.split(',').map(p => p.trim());

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(num => parseInt(num, 10));
                if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > maxPages) {
                    throw new Error(t.rotate_error_invalid_range);
                }
                for (let i = start; i <= end; i++) {
                    pages.add(i - 1);
                }
            } else {
                const page = parseInt(part, 10);
                if (isNaN(page) || page < 1 || page > maxPages) {
                    throw new Error(t.rotate_error_invalid_page);
                }
                pages.add(page - 1);
            }
        }

        return Array.from(pages).sort((a, b) => a - b);
    };

    const rotatePdf = async () => {
        if (!file) return;

        setIsProcessing(true);
        const toastId = toast.loading(t.rotate_loading);

        try {
            const pageIndicesToRotate = parsePageRange(pageRange, totalPages);
            if (pageIndicesToRotate.length === 0) throw new Error(t.rotate_error_no_page);

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();

            for (const pageIndex of pageIndicesToRotate) {
                const page = pages[pageIndex];
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + rotationAngle));
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const baseName = file.name.replace('.pdf', '');
            a.download = `${baseName}_rotated.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(t.rotate_success, { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t.toast_upload_fail, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pt-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t.rotate_title}</h1>
                    <p className="text-gray-500 mt-1">{t.rotate_subtitle}</p>
                </div>
            </div>

            <AdPlaceholder position="top" />

            <div className="grid md:grid-cols-[1fr_300px] gap-8">
                <div className="flex flex-col gap-6">
                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[300px] ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-gray-50'
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
                                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 text-emerald-500">
                                    <UploadCloud className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{t.rotate_drag_drop}</h3>
                                <p className="text-gray-500">{t.rotate_drag_drop_sub}</p>
                            </label>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center min-h-[300px] justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1 max-w-[80%] truncate">{file.name}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-6 bg-gray-100 px-3 py-1 rounded-full">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {t.rotate_total_pages} {totalPages}
                            </p>
                            <button
                                onClick={() => { setFile(null); setPageRange(''); setRotationAngle(90); }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                {t.rotate_change_file}
                            </button>
                        </div>
                    )}

                    <AdPlaceholder position="mid" className="p-4 bg-emerald-50/10 border-emerald-100/50" />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <RotateCw className="w-5 h-5 text-emerald-500" />
                            {t.rotate_options}
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.rotate_direction_label}
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => setRotationAngle(90)}
                                    disabled={!file}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${rotationAngle === 90 ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {t.rotate_direction_90}
                                </button>
                                <button
                                    onClick={() => setRotationAngle(180)}
                                    disabled={!file}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${rotationAngle === 180 ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {t.rotate_direction_180}
                                </button>
                                <button
                                    onClick={() => setRotationAngle(270)}
                                    disabled={!file}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${rotationAngle === 270 ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {t.rotate_direction_270}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.rotate_range_label}
                            </label>
                            <input
                                type="text"
                                value={pageRange}
                                onChange={(e) => setPageRange(e.target.value)}
                                placeholder={t.rotate_range_placeholder}
                                disabled={!file}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                            />
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                {t.rotate_range_hint}
                            </p>
                        </div>

                        <button
                            onClick={rotatePdf}
                            disabled={!file || isProcessing}
                            className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${!file
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5'
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
                                    {t.rotate_button}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <AdPlaceholder />
        </div>
    );
}
