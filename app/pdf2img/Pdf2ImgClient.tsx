'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileDown, FileImage, X, Image as ImageIcon, Check } from 'lucide-react';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';

// PDF.js 관련 변수들을 동적 할당하기 위해 선언
let pdfjsLib: any = null;

interface PreviewPage {
    index: number;
    dataUrl: string;
}

export default function Pdf2ImgClient() {
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [previews, setPreviews] = useState<PreviewPage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');

    // 1. PDF.js 동적 임포트 및 워커 설정
    useEffect(() => {
        const loadPdfJS = async () => {
            const pdfjs = await import('pdfjs-dist');
            // workerSrc는 package.json의 버전과 일치해야 함 (^3.11.174)
            pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
            pdfjsLib = pdfjs;
        };
        loadPdfJS();
    }, []);

    // 2. 미리보기 생성 (첫 10페이지만)
    const generatePreviews = async (pdfFile: File) => {
        if (!pdfjsLib) return;
        setIsProcessing(true);
        const toastId = toast.loading(t.organize_loading_preview || 'Generating page previews...');

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = Math.min(pdf.numPages, 12); // 최대 12페이지만 미리보기
            const newPreviews: PreviewPage[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                newPreviews.push({
                    index: i,
                    dataUrl: canvas.toDataURL('image/jpeg', 0.7)
                });
            }
            setPreviews(newPreviews);
            toast.success(t.organize_success_loaded || 'File loaded successfully.', { id: toastId });
        } catch (error) {
            console.error('Preview Error:', error);
            toast.error(t.toast_upload_fail || 'Failed to load PDF previews.', { id: toastId });
            setFile(null);
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
            generatePreviews(selectedFile);
        }
    }, [t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    // 3. 전체 이미지 추출 및 ZIP 다운로드
    const handleConvert = async () => {
        if (!file || !pdfjsLib) return;
        setIsProcessing(true);
        const toastId = toast.loading(t.pdf2img_loading || 'Extracting all pages as images...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const zip = new JSZip();
            const numPages = pdf.numPages;

            // 품질 설정을 위한 상향된 스케일
            const scale = 2.0;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;

                const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
                const extension = format === 'jpeg' ? 'jpg' : 'png';

                // Canvas를 Blob으로 변환
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mimeType, 0.95));
                if (blob) {
                    zip.file(`page_${i}.${extension}`, blob);
                }
            }

            // ZIP 파일 생성
            const zipContent = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipContent);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.pdf$/i, '')}_images.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(t.pdf2img_success || 'Extraction complete! Check your download.', { id: toastId });
        } catch (error) {
            console.error('Conversion Error:', error);
            toast.error(t.toast_upload_fail || 'Error occurred during extraction.', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.pdf2img_title || 'PDF to Image'}</h1>
                <p className="text-lg text-gray-600">{t.pdf2img_subtitle || 'Convert PDF pages into high-quality JPG or PNG images.'}</p>
            </div>

            <AdPlaceholder position="top" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* 왼쪽: 업로드 및 미리보기 영역 */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                        {!file ? (
                            <div
                                {...getRootProps()}
                                className={`border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors flex flex-col items-center justify-center h-full
                                    ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/50'}`}
                            >
                                <input {...getInputProps()} />
                                <FileUp className="w-16 h-16 text-pink-400 mx-auto mb-6" />
                                <p className="text-xl font-semibold text-gray-700 mb-2">{t.pdf2img_drag_drop || 'Drag and drop your PDF here'}</p>
                                <p className="text-gray-500">{t.merge_drag_drop_sub || 'You can select 1 PDF file.'}</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between p-5 bg-pink-50 rounded-2xl border border-pink-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <FileImage className="w-8 h-8 text-pink-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 break-all">{file.name}</p>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setFile(null); setPreviews([]); }}
                                        className="p-2 hover:bg-white rounded-full transition-colors group"
                                    >
                                        <X className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                                    </button>
                                </div>

                                {previews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4">
                                        {previews.map((preview) => (
                                            <div key={preview.index} className="aspect-[1/1.4] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative group shadow-sm">
                                                <img
                                                    src={preview.dataUrl}
                                                    alt={`Page ${preview.index}`}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
                                                    <span className="bg-white/90 w-full py-1 text-center text-[10px] font-bold text-gray-700 border-t border-gray-100">
                                                        Page {preview.index}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 설정 및 실행 영역 */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-pink-500" />
                            {t.pdf2img_format_label || 'Image Format'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                onClick={() => setFormat('jpeg')}
                                className={`py-5 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 relative
                                    ${format === 'jpeg' ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-pink-200 hover:text-gray-500'}`}
                            >
                                <span className="text-xl tracking-wider">JPG</span>
                                {format === 'jpeg' && <Check className="w-5 h-5 absolute top-2 right-2 p-1 bg-pink-500 text-white rounded-full" />}
                            </button>
                            <button
                                onClick={() => setFormat('png')}
                                className={`py-5 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 relative
                                    ${format === 'png' ? 'border-pink-500 bg-pink-50 text-pink-600 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-pink-200 hover:text-gray-500'}`}
                            >
                                <span className="text-xl tracking-wider">PNG</span>
                                {format === 'png' && <Check className="w-5 h-5 absolute top-2 right-2 p-1 bg-pink-500 text-white rounded-full" />}
                            </button>
                        </div>

                        <AdPlaceholder position="mid" className="p-6 my-4 border-dashed border-gray-100 bg-gray-50/30" />

                        <div className="space-y-4">
                            <button
                                onClick={handleConvert}
                                disabled={!file || isProcessing}
                                className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
                                    ${!file || isProcessing
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-100'}`}
                            >
                                <FileDown className="w-6 h-6" />
                                {isProcessing ? (t.pdf2img_loading || 'Processing...') : (t.pdf2img_button || 'Convert to Images')}
                            </button>

                            {file && !isProcessing && (
                                <p className="text-center text-xs text-gray-400 font-medium">
                                    {format === 'jpeg' ? '⚡ Fast processing, smaller size' : '💎 High quality, lossless'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AdPlaceholder />
        </div>
    );
}
