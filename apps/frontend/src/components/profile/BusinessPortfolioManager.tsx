"use client";

import React, { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { BusinessPortfolio as PortfolioItem } from '@/types';

interface BusinessPortfolioManagerProps {
    portfolios: PortfolioItem[];
    token: string | null;
    onRefresh: () => void;
}

export default function BusinessPortfolioManager({ portfolios, token, onRefresh }: BusinessPortfolioManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [newItem, setNewItem] = useState<PortfolioItem>({ title: '', description: '', images: [] } as any);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);
        const uploadedUrls: string[] = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const data = await api.upload<{ fileUrl: string }>('/business-profiles/portfolios/upload', formData);
                uploadedUrls.push(data.fileUrl);
            } catch (err) {
                console.error('Upload failed', err);
            }
        }

        if (editingItem) {
            setEditingItem({ ...editingItem, images: [...editingItem.images, ...uploadedUrls] });
        } else {
            setNewItem({ ...newItem, images: [...newItem.images, ...uploadedUrls] });
        }
        setIsUploading(false);
    };

    const handleSave = async () => {
        const item = editingItem || newItem;
        const endpoint = editingItem
            ? `/business-profiles/portfolios/${editingItem.id}`
            : `/business-profiles/portfolios`;

        try {
            if (editingItem) {
                await api.put(endpoint, item);
            } else {
                await api.post(endpoint, item);
            }

            setIsAdding(false);
            setEditingItem(null);
            setNewItem({ title: '', description: '', images: [] } as any);
            onRefresh();
        } catch (err) {
            console.error('Save failed', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/business-profiles/portfolios/${id}`);
            onRefresh();
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const removeImage = (idx: number) => {
        if (editingItem) {
            setEditingItem({ ...editingItem, images: editingItem.images.filter((_, i) => i !== idx) });
        } else {
            setNewItem({ ...newItem, images: newItem.images.filter((_, i) => i !== idx) });
        }
    };

    const activeItem = editingItem || newItem;

    return (
        <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">포트폴리오 관리</h2>
                {!isAdding && !editingItem && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all"
                    >
                        + 신규 프로젝트 추가
                    </button>
                )}
            </div>

            {(isAdding || editingItem) ? (
                <div className="bg-surface p-8 rounded-3xl border border-primary/20 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">프로젝트명</label>
                        <input
                            type="text"
                            value={activeItem.title}
                            onChange={(e) => editingItem ? setEditingItem({ ...editingItem, title: e.target.value }) : setNewItem({ ...newItem, title: e.target.value })}
                            className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                            placeholder="예: 2025 어린이 로봇 캠프"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">설명</label>
                        <textarea
                            value={activeItem.description}
                            onChange={(e) => editingItem ? setEditingItem({ ...editingItem, description: e.target.value }) : setNewItem({ ...newItem, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-surface rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                            placeholder="프로젝트에 대한 간단한 설명을 적어주세요."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-4">이미지 추가</label>
                        <div className="grid grid-cols-2 shadow-inner md:grid-cols-4 gap-4 mb-4">
                            {activeItem.images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200">
                                    <img src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL || 'https://schoolit.shop'}${img}`} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-slate-50/50"
                            >
                                <span className="text-2xl">{isUploading ? '⌛' : '+'}</span>
                                <span className="text-xs font-bold mt-1">사진 추가</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleUploadImage} className="hidden" accept="image/*" multiple />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setIsAdding(false); setEditingItem(null); }}
                            className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!activeItem.title}
                            className="px-8 py-2 bg-primary text-white rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-50"
                        >
                            저장하기
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolios.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-foreground-muted text-sm">등록된 포트폴리오가 없습니다.</p>
                        </div>
                    ) : (
                        portfolios.map((p) => (
                            <div key={p.id} className="bg-surface rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm group">
                                <div className="aspect-video bg-slate-100 relative">
                                    {p.images[0] ? (
                                        <img src={p.images[0].startsWith('http') ? p.images[0] : `${process.env.NEXT_PUBLIC_API_URL || 'https://schoolit.shop'}${p.images[0]}`} alt={p.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">📁</div>
                                    )}
                                    {p.images.length > 1 && (
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-white text-[10px] font-bold">
                                            +{p.images.length - 1} images
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-foreground mb-1">{p.title}</h3>
                                    <p className="text-xs text-foreground-muted line-clamp-2 mb-4">{p.description}</p>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingItem(p)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(p.id!)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
