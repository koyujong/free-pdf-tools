'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { FileDown, FileUp, X, KeySquare, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';
import CountdownOverlay from '../../components/CountdownOverlay';

export default function ProtectPage() {
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isProtecting, setIsProtecting] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [pendingDownload, setPendingDownload] = useState<{ url: string; filename: string } | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile.type !== 'application/pdf') {
                toast.error(t.protect_error_not_pdf || t.split_error_not_pdf);
                return;
            }
            setFile(selectedFile);
            setPassword('');
            setConfirmPassword('');
            toast.success(t.protect_success_loaded || t.split_success_loaded);
        }
    }, [t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const handleProtect = async () => {
        if (!file) return;

        if (!password) {
            toast.error(t.protect_error_password_empty || 'Please enter a password.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t.protect_error_password_match || 'Passwords do not match.');
            return;
        }

        setIsProtecting(true);
        const toastId = toast.loading(t.protect_loading || 'Encrypting PDF...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // 문서 패스워드 설정 (열람 권한 및 소유자 권한 암호화)
            // 주의: pdf-lib TS 정의에 userPassword 등이 누락되어 있으나 실제 런타임에선 동작하므로 any로 캐스팅
            const pdfBytes = await pdfDoc.save({
                useObjectStreams: false,
                userPassword: password,
                ownerPassword: password,
                permissions: {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    documentAssembly: false,
                },
            } as any);

            // Blob 변환 및 다운로드 (Uint8Array 래핑으로 타입 에러 방지)
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            toast.dismiss(toastId);
            setPendingDownload({ url, filename: `protected_${file.name}` });
            setShowCountdown(true);
        } catch (error: any) {
            console.error('PDF Encryption Error:', error);
            toast.error(t.toast_upload_fail || 'Error occurred while saving.', { id: toastId });
        } finally {
            setIsProtecting(false);
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
            toast.success(t.protect_success || 'Encryption complete!');
        }
        setShowCountdown(false);
    }, [pendingDownload, t.protect_success]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <p className="text-lg text-gray-600">{t.protect_subtitle || 'Secure your PDF files by adding a password.'}</p>
            </div>

            <AdPlaceholder position="top" />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12">
                {!file ? (
                    <div
                        {...getRootProps()}
                        className={`border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'}`}
                    >
                        <input {...getInputProps()} />
                        <FileUp className="w-16 h-16 text-orange-400 mx-auto mb-6" />
                        <p className="text-xl font-semibold text-gray-700 mb-2">{t.protect_drag_drop || 'Drag a single PDF file here'}</p>
                        <p className="text-gray-500">{t.protect_drag_drop_sub || 'Please select 1 original file to protect.'}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Selected File Viewer */}
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="flex items-center gap-4">
                                <KeySquare className="w-10 h-10 text-orange-500" />
                                <div>
                                    <p className="font-semibold text-gray-800 break-all">{file.name}</p>
                                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setFile(null); setPassword(''); setConfirmPassword(''); }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title={t.protect_change_file || 'Select another file'}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Security Options */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-gray-500" />
                                {t.protect_options || 'Security Options'}
                            </h3>

                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.protect_password_label || 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t.protect_password_placeholder || 'Enter a strong password'}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t.protect_password_confirm_label || 'Confirm Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t.protect_password_confirm_placeholder || 'Re-enter your password'}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <AdPlaceholder position="mid" className="p-4 bg-orange-50/10 border-orange-100/50" />

                        <button
                            onClick={handleProtect}
                            disabled={isProtecting || !password || !confirmPassword}
                            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-colors
                                ${isProtecting || !password || !confirmPassword ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'}`}
                        >
                            <FileDown className="w-6 h-6" />
                            {isProtecting ? (t.protect_loading || 'Encrypting PDF...') : (t.protect_button || 'Protect & Download')}
                        </button>
                    </div>
                )}
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
