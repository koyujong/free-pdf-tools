'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { FileDown, FileUp, X, LayoutGrid, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';

// PDF.js 관련 변수들을 동적 할당하기 위해 선언
let pdfjsLib: any = null;

interface PageObj {
    id: string; // React Key
    originalIndex: number; // 추출 시 참조할 원본 PDF의 페이지 번호
    dataUrl: string; // 썸네일 이미지 URL
}

export default function OrganizeClient() {
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageObj[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Drag and Drop 관련 상태
    const [draggedPageIdx, setDraggedPageIdx] = useState<number | null>(null);

    // 1. PDF.js 동적 임포트 (Client-side 환경 보장)
    useEffect(() => {
        const loadPdfJS = async () => {
            const pdfjs = await import('pdfjs-dist');
            pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
            pdfjsLib = pdfjs;
        };
        loadPdfJS();
    }, []);

    // 2. PDF 파일 업로드 시 pdf.js를 이용해 썸네일 추출 (데이터 URL 변환)
    const renderPDFThumbnails = async (pdfFile: File) => {
        setIsProcessing(true);
        const toastId = toast.loading(t.organize_loading_preview || 'Generating page previews...');

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const newPages: PageObj[] = [];

            // 렌더링 품질 배율 (썸네일이므로 작게)
            const scale = 1.0;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                await page.render(renderContext).promise;

                // Canvas를 base64 Data URL로 변환
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

                newPages.push({
                    id: `page_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    originalIndex: i - 1, // pdf-lib은 0부터 시작하므로
                    dataUrl
                });
            }

            setPages(newPages);
            toast.success(t.organize_success_loaded || 'File loaded successfully.', { id: toastId });
        } catch (error) {
            console.error('PDF Rendering Error:', error);
            toast.error(t.toast_upload_fail || 'Failed to render PDF preview.', { id: toastId });
            setFile(null); // 실패 시 초기화
        } finally {
            setIsProcessing(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile.type !== 'application/pdf') {
                toast.error(t.organize_error_not_pdf || 'Only PDF files are allowed.');
                return;
            }
            setFile(selectedFile);
            renderPDFThumbnails(selectedFile);
        }
    }, [t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    // 2. React Native Drag events for reordering
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedPageIdx(index);
        // 드래그 중인 요소를 약간 투명하게 만들기 위해 효과 설정 가능
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault(); // 기본 동작 방지
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedPageIdx === null || draggedPageIdx === dropIndex) return;

        // 드래그 아이템의 위치를 변경 (배열 재정렬)
        setPages((prevPages) => {
            const newPages = [...prevPages];
            const draggedItem = newPages.splice(draggedPageIdx, 1)[0];
            newPages.splice(dropIndex, 0, draggedItem);
            return newPages;
        });

        setDraggedPageIdx(null);
    };

    const handleDragEnd = () => {
        setDraggedPageIdx(null);
    };

    // 페이지 삭제
    const removePage = (idToRemove: string) => {
        setPages(prev => prev.filter(p => p.id !== idToRemove));
    };

    // 3. pdf-lib을 통한 최종 파일 생성 및 병합
    const handleOrganize = async () => {
        if (!file || pages.length === 0) return;

        setIsProcessing(true);
        const toastId = toast.loading(t.organize_loading || 'Reorganizing PDF...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const originalPdf = await PDFDocument.load(arrayBuffer);

            // 새 PDF 문서 생성
            const newPdf = await PDFDocument.create();

            // 사용자가 화면에 둔 페이지들(pages 배열 순서대로)만 원본에서 복사
            const indicesToCopy = pages.map(p => p.originalIndex);

            // 모든 페이지를 한번에 복사 (성능 향상 유지)
            const copiedPages = await newPdf.copyPages(originalPdf, indicesToCopy);

            // 새 문서에 추가 (현재 배열 순서와 1:1 매칭됨)
            copiedPages.forEach((copiedPage) => {
                newPdf.addPage(copiedPage);
            });

            // Blob 변환 및 다운로드
            const pdfBytes = await newPdf.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `organized_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(t.organize_success || 'Organization complete!', { id: toastId });
        } catch (error: any) {
            console.error('PDF Organization Error:', error);
            toast.error(t.toast_upload_fail || 'Error occurred while saving.', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.organize_title || 'Organize PDF'}</h1>
                <p className="text-lg text-gray-600">{t.organize_subtitle || 'Sort, rearrange, or delete PDF pages with drag & drop.'}</p>
            </div>

            <AdPlaceholder position="top" />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12">
                {!file ? (
                    <div
                        {...getRootProps()}
                        className={`border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50/50'}`}
                    >
                        <input {...getInputProps()} />
                        <FileUp className="w-16 h-16 text-teal-400 mx-auto mb-6" />
                        <p className="text-xl font-semibold text-gray-700 mb-2">{t.organize_drag_drop || 'Drag a single PDF file here'}</p>
                        <p className="text-gray-500">{t.organize_drag_drop_sub || 'Please select 1 original file to organize.'}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Selected File Viewer */}
                        <div className="flex items-center justify-between p-4 bg-teal-50 rounded-2xl border border-teal-100 flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <LayoutGrid className="w-10 h-10 text-teal-500" />
                                <div>
                                    <p className="font-semibold text-gray-800 break-all">{file.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {pages.length} Pages
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setFile(null); setPages([]); }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                            >
                                {t.organize_change_file || 'Select another file'}
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-sm font-medium text-gray-500 text-center bg-gray-50 py-3 rounded-xl border border-gray-100">
                            💡 {t.organize_delete_hint || 'Click the X icon to remove pages. Drag images to reorder.'}
                        </p>

                        {/* Thumbnail Grid & Drag/Drop Area */}
                        {pages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
                                {pages.map((page, idx) => (
                                    <div
                                        key={page.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        className={`relative group bg-white border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-move
                                            ${draggedPageIdx === idx ? 'opacity-50 border-teal-500 scale-95' : 'border-gray-200 hover:border-teal-300'}`}
                                    >
                                        {/* 페이지 삭제 버튼 */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity z-10 shadow-sm"
                                            title="Delete Page"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        {/* 드래그 힌트 아이콘 */}
                                        <div className="absolute top-2 left-2 bg-black/40 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <GripVertical className="w-4 h-4" />
                                        </div>

                                        {/* 썸네일 이미지 */}
                                        <div className="aspect-[1/1.4] w-full bg-gray-50 flex items-center justify-center p-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={page.dataUrl}
                                                alt={`Page ${page.originalIndex + 1}`}
                                                className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-sm"
                                            />
                                        </div>

                                        {/* 페이지 하단 라벨 (현재 순서 번호 표시) */}
                                        <div className="bg-gray-100 py-2 text-center text-xs font-semibold text-gray-700 border-t border-gray-200">
                                            {(t.organize_page_number || 'Page {num}').replace('{num}', (idx + 1).toString())}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <AdPlaceholder position="mid" className="p-4 border-dashed border-gray-100 bg-gray-50/30" />

                        <button
                            onClick={handleOrganize}
                            disabled={isProcessing || pages.length === 0}
                            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-colors mt-8
                                ${isProcessing || pages.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'}`}
                        >
                            <FileDown className="w-6 h-6" />
                            {isProcessing ? (t.organize_loading || 'Reorganizing PDF...') : (t.organize_button || 'Apply & Download')}
                        </button>
                    </div>
                )}
            </div>

            <AdPlaceholder />
        </div>
    );
}
