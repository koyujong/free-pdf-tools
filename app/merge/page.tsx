'use client';

import React, { useState, useRef, useCallback, DragEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, FileText, Trash2, GripVertical, Download, ArrowLeft, Loader2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';
import CountdownOverlay from '../../components/CountdownOverlay';

// 관리할 파일 인터페이스 정의
interface PdfFile {
    id: string; // 순서 변경(Drag & Drop)을 위한 고유 ID
    file: File;
}

export default function MergePdfPage() {
    const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [pendingDownload, setPendingDownload] = useState<{ url: string; filename: string } | null>(null);
    const { t } = useLanguage();

    // HTML5 Drag & Drop 상태 관리를 위한 Ref
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // 1. 파일 드래그 & 업로드 관련 함수
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
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    // 1-1. PDF 파일만 필터링하여 상태에 추가
    const addFiles = (files: File[]) => {
        const validFiles = files.filter(file => file.type === 'application/pdf');

        if (validFiles.length !== files.length) {
            toast.error(t.merge_error_not_pdf, { id: 'invalid-file' });
        }

        if (validFiles.length > 0) {
            const newFiles = validFiles.map(file => ({
                id: crypto.randomUUID(), // 고유 ID 생성
                file
            }));
            setPdfFiles(prev => [...prev, ...newFiles]);
            toast.success(`${validFiles.length} ${t.merge_success_added}`);
        }
    };

    // 1-2. 개별 파일 삭제 로직
    const removeFile = (idToRemove: string) => {
        setPdfFiles(prev => prev.filter(f => f.id !== idToRemove));
    };

    // 2. 리스트 순서 변경 (Native Drag & Drop)
    const handleSortStart = (index: number) => {
        dragItem.current = index;
    };

    const handleSortEnter = (index: number) => {
        dragOverItem.current = index;
    };

    const handleSortEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const sortedFiles = [...pdfFiles];
            // 드래그한 아이템을 잘라내서 새로운 위치에 삽입
            const draggedItemContent = sortedFiles.splice(dragItem.current, 1)[0];
            sortedFiles.splice(dragOverItem.current, 0, draggedItemContent);
            setPdfFiles(sortedFiles);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    // 3. ✨ 핵심: pdf-lib을 이용한 병합 로직 (100% Client-side)
    const mergePdfs = async () => {
        if (pdfFiles.length < 2) {
            toast.error(t.merge_error_min_2);
            return;
        }

        setIsProcessing(true);
        const toastId = toast.loading(t.merge_loading);

        try {
            // 빈 캔버스(새로운 PDF 문서) 생성
            const mergedPdf = await PDFDocument.create();

            // 사용자가 정렬한 순서대로 파일들을 순회
            for (const pdfObj of pdfFiles) {
                // File 객체를 ArrayBuffer로 변환
                const arrayBuffer = await pdfObj.file.arrayBuffer();

                // ArrayBuffer를 pdf-lib 객체로 로드
                const pdf = await PDFDocument.load(arrayBuffer);

                // 원본 PDF의 모든 페이지 복사
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

                // 빈 캔버스에 복사한 페이지들을 순서대로 이어 붙임
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
            }

            // 4. 합쳐진 문서를 바이트 배열로 직렬화하여 다운로드
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            toast.dismiss(toastId);
            setPendingDownload({ url, filename: `merged_${new Date().getTime()}.pdf` });
            setShowCountdown(true);
        } catch (error) {
            console.error(error);
            toast.error(t.merge_failed, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCountdownComplete = useCallback(() => {
        if (pendingDownload) {
            const a = document.createElement('a');
            a.href = pendingDownload.url;
            a.download = pendingDownload.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pendingDownload.url);
            setPendingDownload(null);
            toast.success(t.merge_success);
        }
        setShowCountdown(false);
    }, [pendingDownload, t.merge_success]);

    return (
        <div className="max-w-4xl mx-auto px-4 pt-8">
            {/* 뒤로가기 및 헤더 */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t.merge_title}</h1>
                    <p className="text-gray-500 mt-1">{t.merge_subtitle}</p>
                </div>
            </div>

            <AdPlaceholder position="top" />

            <div className="grid md:grid-cols-[1fr_300px] gap-8">
                {/* 중앙: 파일 목록 및 업로드 구역 */}
                <div className="flex flex-col gap-4">

                    {/* 파일 리스트 (Drag & Drop 정렬) */}
                    {pdfFiles.length > 0 && (
                        <>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                                {pdfFiles.map((item, index) => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={() => handleSortStart(index)}
                                        onDragEnter={() => handleSortEnter(index)}
                                        onDragEnd={handleSortEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="flex items-center gap-3 p-3 mb-2 last:mb-0 bg-gray-50 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all cursor-move group"
                                    >
                                        <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.file.name}</p>
                                            <p className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            onClick={() => removeFile(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <AdPlaceholder position="mid" className="p-4 bg-blue-50/10 border-blue-100/50" />
                        </>
                    )}

                    {/* 추가 업로드 드롭존 */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            multiple
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleFileInput}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 mb-1">{t.merge_drag_drop}</p>
                            <p className="text-sm text-gray-500">{t.merge_drag_drop_sub}</p>
                        </label>
                    </div>
                </div>

                {/* 우측 사이드바: 액션 패널 */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-500" />
                            {t.merge_summary}
                        </h3>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 mb-6">
                            <span className="text-gray-500 text-sm">{t.merge_added_files}</span>
                            <span className="font-semibold text-gray-900">{pdfFiles.length} EA</span>
                        </div>

                        <button
                            onClick={mergePdfs}
                            disabled={pdfFiles.length < 2 || isProcessing}
                            className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${pdfFiles.length < 2
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'
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
                                    {t.merge_button}
                                </>
                            )}
                        </button>
                        {pdfFiles.length > 0 && pdfFiles.length < 2 && (
                            <p className="text-xs text-center text-rose-500 mt-3 font-medium">{t.merge_need_more}</p>
                        )}
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
