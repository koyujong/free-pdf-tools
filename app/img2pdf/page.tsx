'use client';

import React, { useState, DragEvent, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { UploadCloud, Image as ImageIcon, Download, ArrowLeft, Loader2, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';

interface ImageFile {
    id: string;
    file: File;
    previewUrl: string;
}

export default function ImgToPdfPage() {
    const { t } = useLanguage();
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
        // 동일한 파일 재업로드 시 감지를 위해 value 초기화
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFiles = (uploadedFiles: File[]) => {
        const validImages = uploadedFiles.filter(file =>
            file.type === 'image/jpeg' || file.type === 'image/png'
        );

        if (validImages.length !== uploadedFiles.length) {
            toast.error(t.img2pdf_error_not_img);
        }

        if (validImages.length > 0) {
            const newImageFiles = validImages.map(file => ({
                id: Math.random().toString(36).substring(7),
                file,
                previewUrl: URL.createObjectURL(file) // 미리보기 URL 생성
            }));

            setImages(prev => [...prev, ...newImageFiles]);
            toast.success(`${validImages.length} ${t.merge_success_added}`);
        }
    };

    const removeImage = (idToRemove: string) => {
        setImages(images.filter(img => {
            if (img.id === idToRemove) {
                URL.revokeObjectURL(img.previewUrl); // 메모리 릭 방지
                return false;
            }
            return true;
        }));
    };

    // 이미지 파일을 PDF 페이지 크기에 맞게 리사이징하여 그리는 로직
    const createPdfFromImages = async () => {
        if (images.length === 0) return;

        setIsProcessing(true);
        const toastId = toast.loading(t.img2pdf_loading);

        try {
            const pdfDoc = await PDFDocument.create();

            for (const imgObj of images) {
                const arrayBuffer = await imgObj.file.arrayBuffer();
                let imageEmbed;

                if (imgObj.file.type === 'image/jpeg' || imgObj.file.type === 'image/jpg') {
                    imageEmbed = await pdfDoc.embedJpg(arrayBuffer);
                } else if (imgObj.file.type === 'image/png') {
                    imageEmbed = await pdfDoc.embedPng(arrayBuffer);
                } else {
                    continue;
                }

                const imgDims = imageEmbed.scale(1);

                // 페이지 크기를 원본 이미지 크기와 동일하게 설정 (A4 고정 안함 - 고화질 앨범용)
                const page = pdfDoc.addPage([imgDims.width, imgDims.height]);

                page.drawImage(imageEmbed, {
                    x: 0,
                    y: 0,
                    width: imgDims.width,
                    height: imgDims.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `images_to_pdf_${new Date().getTime()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(t.img2pdf_success, { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t.toast_upload_fail, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 pt-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t.img2pdf_title}</h1>
                    <p className="text-gray-500 mt-1">{t.img2pdf_subtitle}</p>
                </div>
            </div>

            <AdPlaceholder position="top" />

            <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
                <div className="flex flex-col gap-6">
                    {/* 최상단: 드롭 영역 (항상 노출되어 추가 업로드 편의 제공) */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging
                            ? 'border-violet-500 bg-violet-50 scale-[1.02]'
                            : 'border-gray-300 bg-white hover:border-violet-400 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/png, image/jpeg"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileInput}
                        />
                        <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4 text-violet-500">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{t.img2pdf_drag_drop}</h3>
                        <p className="text-sm text-gray-500">{t.img2pdf_drag_drop_sub}</p>
                    </div>

                    {/* 추가된 이미지 그리드 뷰 */}
                    {images.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                                {t.img2pdf_added_files} ({images.length})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:border-violet-300 transition-colors">
                                        <img
                                            src={img.previewUrl}
                                            alt={img.file.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-xs text-white font-medium truncate px-1 drop-shadow-md">
                                                {index + 1}. {img.file.name}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <AdPlaceholder position="mid" className="p-4 bg-violet-50/10 border-violet-100/50" />
                </div>

                {/* 우측 사이드바: 옵션 설정 및 실행 */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-violet-500" />
                            {t.img2pdf_summary}
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">{t.img2pdf_added_files}</span>
                                <span className="text-xl font-bold text-violet-600">{images.length}</span>
                            </div>
                        </div>

                        <button
                            onClick={createPdfFromImages}
                            disabled={images.length === 0 || isProcessing}
                            className={`w-full py-4 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${images.length === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-violet-600 text-white hover:bg-violet-700 hover:shadow-lg hover:-translate-y-0.5'
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
                                    {t.img2pdf_button}
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
