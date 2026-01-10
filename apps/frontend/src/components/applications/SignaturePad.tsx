'use client';

import React, { useRef, useState, useEffect } from 'react';
import StandardCard from '@/components/ui/StandardCard';
import { X, Check, RotateCcw, Pen } from 'lucide-react';

interface SignaturePadProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (signatureData: string) => Promise<void>;
    contractInfo?: {
        jobTitle: string;
        schoolName: string;
    };
}

export default function SignaturePad({
    isOpen,
    onClose,
    onSubmit,
    contractInfo
}: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        setHasSignature(true);
        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoords(e);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1e293b';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handleSubmit = async () => {
        if (!hasSignature || !canvasRef.current) return;

        setIsSubmitting(true);
        try {
            const signatureData = canvasRef.current.toDataURL('image/png');
            await onSubmit(signatureData);
            onClose();
        } catch (error) {
            console.error('Signature submission failed:', error);
            alert('서명 저장에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <StandardCard className="w-full max-w-md shadow-2xl" noPadding>
                {/* Header */}
                <div className="bg-slate-900 text-white p-5 flex justify-between items-start rounded-t-2xl">
                    <div>
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Pen className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">E-SIGNATURE</span>
                        </div>
                        <h2 className="text-lg font-black">전자 서명</h2>
                        {contractInfo && (
                            <p className="text-xs text-slate-400 mt-1">
                                {contractInfo.schoolName} · {contractInfo.jobTitle}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Canvas Area */}
                <div className="p-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 text-center mb-3">
                            아래 영역에 서명해 주세요
                        </p>
                        <canvas
                            ref={canvasRef}
                            width={320}
                            height={150}
                            className="w-full bg-white rounded-lg border border-slate-200 cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700/50">
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            ⚠️ <strong>법적 효력 안내:</strong> 본 전자서명은 「전자문서 및 전자거래 기본법」에 따른
                            공인전자서명이 아닙니다. 참고용 초안으로만 활용하시고, 실제 계약은 학교 행정실을 통해
                            정식 서류로 진행해 주세요.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700 flex justify-between rounded-b-2xl">
                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> 다시 그리기
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!hasSignature || isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>처리 중...</>
                        ) : (
                            <>
                                <Check className="w-4 h-4" /> 서명 완료
                            </>
                        )}
                    </button>
                </div>
            </StandardCard>
        </div>
    );
}
