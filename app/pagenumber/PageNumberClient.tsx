'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FileUp, FileDown, Hash, X, Layout, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';

type Position = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right';

export default function PageNumberClient() {
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // 페이지 번호 설정 상태
    const [position, setPosition] = useState<Position>('bottom-center');
    const [startNumber, setStartNumber] = useState(1);
    const [fontSize, setFontSize] = useState(12);
    const [margin, setMargin] = useState(30);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile.type !== 'application/pdf') {
                toast.error(t.organize_error_not_pdf || 'Only PDF files are allowed.');
                return;
            }
            setFile(selectedFile);
        }
    }, [t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const handleAddPageNumbers = async () => {
        if (!file) return;
        setIsProcessing(true);
        const toastId = toast.loading(t.pagenumber_loading || 'Adding page numbers...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();

            pages.forEach((page, index) => {
                const { width, height } = page.getSize();
                const pageNum = startNumber + index;
                const text = `${pageNum}`;
                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);

                let x = margin;
                let y = margin;

                // X 좌표 계산
                if (position.includes('center')) {
                    x = width / 2 - textWidth / 2;
                } else if (position.includes('right')) {
                    x = width - margin - textWidth;
                }

                // Y 좌표 계산
                if (position.includes('top')) {
                    y = height - margin - fontSize;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `numbered_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(t.pagenumber_success || 'Page numbers added successfully!', { id: toastId });
        } catch (error) {
            console.error('Page Numbering Error:', error);
            toast.error(t.toast_upload_fail || 'Error occurred while adding page numbers.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.pagenumber_title || 'Page Numbering'}</h1>
                <p className="text-lg text-gray-600">{t.pagenumber_subtitle || 'Add page numbers to your PDF document easily.'}</p>
            </div>

            <AdPlaceholder position="top" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* 왼쪽: 업로드 영역 */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex flex-col">
                        {!file ? (
                            <div
                                {...getRootProps()}
                                className={`flex-1 border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors flex flex-col items-center justify-center
                                    ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                            >
                                <input {...getInputProps()} />
                                <Hash className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                                <p className="text-xl font-semibold text-gray-700 mb-2">{t.pdf2img_drag_drop || 'Drag and drop your PDF here'}</p>
                                <p className="text-gray-500">{t.merge_drag_drop_sub || 'Please select 1 PDF file to label.'}</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                                <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Hash className="w-8 h-8 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 break-all">{file.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">Ready for page numbering</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setFile(null)} className="p-2 hover:bg-white rounded-full transition-colors group">
                                        <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                                    </button>
                                </div>

                                <div className="flex-1 mt-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center p-12 relative overflow-hidden">
                                    <div className="text-center space-y-4 max-w-sm z-10 bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-white shadow-sm">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                                            <Type className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-700">Preview Layout</h4>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Numbers will be added at the <span className="text-indigo-600 font-bold underline decoration-2 underline-offset-4">{position.replace('-', ' ')}</span> of each page starting from {startNumber}.
                                        </p>
                                    </div>
                                    {/* 단순 위치 시각화 */}
                                    <div className="absolute inset-8 border border-gray-200 rounded-lg pointer-events-none opacity-40">
                                        <div className={`absolute w-3 h-3 bg-indigo-500 rounded-full transition-all duration-300
                                            ${position === 'top-left' ? 'top-2 left-2' : ''}
                                            ${position === 'top-center' ? 'top-2 left-1/2 -translate-x-1/2' : ''}
                                            ${position === 'top-right' ? 'top-2 right-2' : ''}
                                            ${position === 'bottom-left' ? 'bottom-2 left-2' : ''}
                                            ${position === 'bottom-center' ? 'bottom-2 left-1/2 -translate-x-1/2' : ''}
                                            ${position === 'bottom-right' ? 'bottom-2 right-2' : ''}
                                        `}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 설정 컨트롤 */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24 space-y-8">
                        {/* 위치 선택 */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                                <Layout className="w-4 h-4 text-indigo-500" />
                                {t.pagenumber_pos_label || 'Position Preset'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as Position[]).map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => setPosition(pos)}
                                        className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center relative
                                            ${position === pos ? 'border-indigo-500 bg-indigo-50' : 'border-gray-50 hover:border-indigo-200'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${position === pos ? 'bg-indigo-500 scale-110' : 'bg-gray-200'}
                                            ${pos === 'top-left' ? 'absolute top-2 left-2' : ''}
                                            ${pos === 'top-center' ? 'absolute top-2 left-1/2 -translate-x-1/2' : ''}
                                            ${pos === 'top-right' ? 'absolute top-2 right-2' : ''}
                                            ${pos === 'bottom-left' ? 'absolute bottom-2 left-2' : ''}
                                            ${pos === 'bottom-center' ? 'absolute bottom-2 left-1/2 -translate-x-1/2' : ''}
                                            ${pos === 'bottom-right' ? 'absolute bottom-2 right-2' : ''}
                                        `}></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 시작 번호 및 폰트 크기 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                    Start From
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={startNumber}
                                    onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-center text-indigo-600"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                    Font ({fontSize}px)
                                </label>
                                <input
                                    type="number"
                                    min="8"
                                    max="72"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-center text-indigo-600"
                                />
                            </div>
                        </div>

                        {/* 여백 설정 */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-gray-700">
                                    Margin From Edge
                                </label>
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-sm">{margin}px</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={margin}
                                onChange={(e) => setMargin(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <AdPlaceholder position="mid" className="p-4 border-dashed border-gray-100 bg-gray-50/30" />

                        <button
                            onClick={handleAddPageNumbers}
                            disabled={!file || isProcessing}
                            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
                                ${!file || isProcessing
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100'}`}
                        >
                            <FileDown className="w-6 h-6" />
                            {isProcessing ? (t.pagenumber_loading || 'Adding...') : (t.pagenumber_button || 'Add Page Numbers')}
                        </button>
                    </div>
                </div>
            </div>

            <AdPlaceholder />
        </div >
    );
}
