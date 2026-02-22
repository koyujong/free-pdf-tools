'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { FileUp, FileDown, Stamp, X, Type, Palette, Move, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';

let pdfjsLib: any = null;

export default function WatermarkClient() {
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 워터마크 설정 상태
    const [text, setText] = useState('CONFIDENTIAL');
    const [opacity, setOpacity] = useState(0.4);
    const [fontSize, setFontSize] = useState(60);
    const [color, setColor] = useState('#ff0000'); // 기본 빨간색
    const [rotation, setRotation] = useState(-45);
    const [position, setPosition] = useState<'center' | 'top' | 'bottom'>('center');

    // 1. PDF.js 로드 (미리보기용)
    useEffect(() => {
        const loadPdfJS = async () => {
            const pdfjs = await import('pdfjs-dist');
            pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
            pdfjsLib = pdfjs;
        };
        loadPdfJS();
    }, []);

    // 2. 워터마크가 적용된 미리보기 생성 (첫 페이지만)
    const generatePreview = useCallback(async (pdfFile: File, wmText: string, wmOpacity: number, wmSize: number, wmColor: string, wmRotation: number) => {
        if (!pdfjsLib) return;

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const firstPage = pdfDoc.getPages()[0];
            const { width, height } = firstPage.getSize();
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // HEX to RGB 변환
            const r = parseInt(wmColor.slice(1, 3), 16) / 255;
            const g = parseInt(wmColor.slice(3, 5), 16) / 255;
            const b = parseInt(wmColor.slice(5, 7), 16) / 255;

            // 워터마크 그리기
            firstPage.drawText(wmText, {
                x: width / 2 - (helveticaFont.widthOfTextAtSize(wmText, wmSize) / 2),
                y: height / 2,
                size: wmSize,
                font: helveticaFont,
                color: rgb(r, g, b),
                opacity: wmOpacity,
                rotate: degrees(wmRotation),
            });

            const pdfBytes = await pdfDoc.save();
            const previewPdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
            const page = await previewPdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                setPreviewUrl(canvas.toDataURL());
            }
        } catch (error) {
            console.error('Preview Error:', error);
        }
    }, []);

    // 설정 변경 시 미리보기 업데이트 (디바운싱 생략, 간단한 텍스트이므로)
    useEffect(() => {
        if (file) {
            generatePreview(file, text, opacity, fontSize, color, rotation);
        }
    }, [file, text, opacity, fontSize, color, rotation, generatePreview]);

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

    // 3. 전체 페이지 워터마크 적용 후 다운로드
    const handleAddWatermark = async () => {
        if (!file) return;
        setIsProcessing(true);
        const toastId = toast.loading(t.watermark_loading || 'Applying watermark to all pages...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();

            const r = parseInt(color.slice(1, 3), 16) / 255;
            const g = parseInt(color.slice(3, 5), 16) / 255;
            const b = parseInt(color.slice(5, 7), 16) / 255;

            pages.forEach((page) => {
                const { width, height } = page.getSize();
                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);

                page.drawText(text, {
                    x: width / 2 - (textWidth / 2),
                    y: height / 2,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(r, g, b),
                    opacity: opacity,
                    rotate: degrees(rotation),
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `watermarked_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(t.watermark_success || 'Watermark added successfully!', { id: toastId });
        } catch (error) {
            console.error('Watermark Error:', error);
            toast.error(t.toast_upload_fail || 'Error occurred while applying watermark.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.watermark_title || 'Add Watermark'}</h1>
                <p className="text-lg text-gray-600">{t.watermark_subtitle || 'Insert text over your PDF pages.'}</p>
            </div>

            <AdPlaceholder position="top" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* 왼쪽: 미리보기 영역 */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px] flex flex-col">
                        {!file ? (
                            <div
                                {...getRootProps()}
                                className={`flex-1 border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors flex flex-col items-center justify-center
                                    ${isDragActive ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50/50'}`}
                            >
                                <input {...getInputProps()} />
                                <Stamp className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
                                <p className="text-xl font-semibold text-gray-700 mb-2">{t.pdf2img_drag_drop || 'Drag and drop your PDF here'}</p>
                                <p className="text-gray-500">{t.merge_drag_drop_sub || 'You can select 1 PDF file.'}</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <Stamp className="w-6 h-6 text-cyan-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 break-all">{file.name}</p>
                                            <p className="text-xs text-gray-500">Previewing first page</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setFile(null); setPreviewUrl(null); }} className="p-2 hover:bg-white rounded-full transition-colors">
                                        <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>

                                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-center justify-center overflow-hidden">
                                    {previewUrl ? (
                                        <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white max-w-full">
                                            <img src={previewUrl} alt="Watermark Preview" className="max-h-[600px] object-contain" />
                                        </div>
                                    ) : (
                                        <div className="animate-pulse text-gray-300 flex flex-col items-center gap-2">
                                            <RotateCcw className="w-8 h-8 animate-spin" />
                                            <p className="text-sm font-medium">Generating preview...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 설정 컨트롤 */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24 space-y-8">
                        {/* 텍스트 입력 */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                <Type className="w-4 h-4 text-cyan-500" />
                                {t.watermark_text_label || 'Watermark Text'}
                            </label>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                                placeholder="Enter text..."
                            />
                        </div>

                        {/* 색상 및 투명도 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                    <Palette className="w-4 h-4 text-cyan-500" />
                                    {t.watermark_color_label || 'Color'}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                    />
                                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">{color}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-3 block">
                                    {t.watermark_opacity_label || 'Opacity'} ({(opacity * 100).toFixed(0)}%)
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                    value={opacity}
                                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        </div>

                        {/* 크기 및 회전 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-3 block">
                                    Size ({fontSize}px)
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-3 block">
                                    Rotation ({rotation}°)
                                </label>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={rotation}
                                    onChange={(e) => setRotation(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        </div>

                        <AdPlaceholder position="mid" className="p-6 border-dashed border-gray-100 bg-gray-50/30" />

                        <button
                            onClick={handleAddWatermark}
                            disabled={!file || !text || isProcessing}
                            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
                                ${!file || !text || isProcessing
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-100'}`}
                        >
                            <FileDown className="w-6 h-6" />
                            {isProcessing ? (t.watermark_loading || 'Applying...') : (t.watermark_button || 'Add Watermark')}
                        </button>
                    </div>
                </div>
            </div>

            <AdPlaceholder />
        </div>
    );
}
