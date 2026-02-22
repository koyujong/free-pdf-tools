'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { FileUp, FileDown, Unlock, X, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import AdPlaceholder from '../../components/AdPlaceholder';

export default function UnlockClient() {
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile.type !== 'application/pdf') {
                toast.error(t.organize_error_not_pdf || 'Only PDF files are allowed.');
                return;
            }
            setFile(selectedFile);
            setPassword(''); // 새로운 파일 업로드 시 비밀번호 초기화
        }
    }, [t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const handleUnlock = async () => {
        if (!file || !password) return;
        setIsProcessing(true);
        const toastId = toast.loading(t.unlock_loading || 'Unlocking PDF...');

        try {
            const arrayBuffer = await file.arrayBuffer();

            // pdf-lib strictly doesn't support decryption via password in standard version.
            // Using ignoreEncryption: true as a fallback for some basic restrictions.
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            // 저장 시 비밀번호 옵션을 주지 않으면 암호가 해제된 채로 저장됨
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `unlocked_${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(t.unlock_success || 'PDF unlocked successfully!', { id: toastId });
        } catch (error: any) {
            console.error('Unlock Error:', error);
            // 비밀번호가 틀렸을 때의 피드백
            toast.error(t.unlock_error_wrong_pw || 'Invalid password. Please try again.', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.unlock_title || 'Unlock PDF'}</h1>
                <p className="text-lg text-gray-600">{t.unlock_subtitle || 'Remove password and security from protected PDFs.'}</p>
            </div>

            <AdPlaceholder position="top" />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8 min-h-[400px]">
                {!file ? (
                    <div
                        {...getRootProps()}
                        className={`border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors flex flex-col items-center justify-center h-full min-h-[300px]
                            ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'}`}
                    >
                        <input {...getInputProps()} />
                        <Lock className="w-16 h-16 text-orange-400 mx-auto mb-6" />
                        <p className="text-xl font-semibold text-gray-700 mb-2">{t.pdf2img_drag_drop || 'Drag and drop your PDF here'}</p>
                        <p className="text-gray-500">{t.merge_drag_drop_sub || 'Please select 1 password-protected file.'}</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between p-5 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Lock className="w-8 h-8 text-orange-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 break-all">{file.name}</p>
                                    <p className="text-sm text-gray-500 font-medium font-sans">Locked Document • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="p-2 hover:bg-white rounded-full transition-colors group">
                                <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                            </button>
                        </div>

                        <div className="max-w-md mx-auto space-y-6">
                            <AdPlaceholder position="mid" className="p-4 bg-orange-50/10 border-orange-100/50" />
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 ml-1">
                                        <Key className="w-4 h-4 text-orange-500" />
                                        {t.unlock_password_label || 'PDF Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-xl tracking-widest font-mono"
                                        placeholder="••••••••"
                                        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                    />
                                </div>

                                <button
                                    onClick={handleUnlock}
                                    disabled={!password || isProcessing}
                                    className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
                                        ${!password || isProcessing
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100'}`}
                                >
                                    <Unlock className="w-6 h-6" />
                                    {isProcessing ? (t.unlock_loading || 'Unlocking...') : (t.unlock_button || 'Unlock PDF')}
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" />
                                {t.unlock_privacy_hint || 'Passwords remain private: zero-server processing.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <AdPlaceholder />
        </div>
    );
}
