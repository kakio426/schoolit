'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, MessageSquare, Upload, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DocumentUpload, RagChatbot } from '@/components/rag';

interface RagStats {
    totalChunks: number;
    sources: string[];
}

type TabType = 'chat' | 'upload' | 'manage';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RagAssistantPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('chat');

    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'ADMIN')) {
            router.replace('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    // Show loading spinner while checking auth
    if (isAuthLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If not admin, return null (will redirect via useEffect)
    if (user.role !== 'ADMIN') {
        return null;
    }
    const [stats, setStats] = useState<RagStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isClearing, setIsClearing] = useState(false);

    const fetchStats = async () => {
        setIsLoadingStats(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/rag/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchStats();
        }
    }, [user]);

    const handleClearDocuments = async () => {
        if (!confirm('모든 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        setIsClearing(true);
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/rag/documents`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchStats();
        } catch (error) {
            console.error('Failed to clear documents:', error);
        } finally {
            setIsClearing(false);
        }
    };

    const tabs = [
        { id: 'chat' as const, label: 'AI 채팅', icon: MessageSquare },
        { id: 'upload' as const, label: '문서 업로드', icon: Upload },
        { id: 'manage' as const, label: '문서 관리', icon: Database },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-muted rounded-xl">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">AI 지침 어시스턴트</h1>
                            <p className="text-sm text-muted-foreground">
                                방과후, 계약 관련 지침을 AI에게 물어보세요
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 pb-8">
                {/* Stats Banner */}
                {stats && stats.totalChunks > 0 && (
                    <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Database className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{stats.totalChunks}개 청크 학습됨</p>
                                <p className="text-sm text-muted-foreground">
                                    {stats.sources.length}개 문서: {stats.sources.join(', ')}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchStats}
                            disabled={isLoadingStats}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <RagChatbot placeholder="방과후 강사 계약 절차가 어떻게 되나요?" />
                )}

                {/* Upload Tab */}
                {activeTab === 'upload' && (
                    <div className="space-y-4">
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4">새 문서 업로드</h2>
                            <DocumentUpload onUploadComplete={fetchStats} />
                        </div>

                        <div className="bg-muted/30 rounded-xl p-4">
                            <h3 className="font-medium mb-2">💡 업로드 팁</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• PDF 형식만 지원됩니다</li>
                                <li>• 문서당 최대 10MB까지 업로드 가능합니다</li>
                                <li>• 텍스트가 잘 추출되도록 스캔본보다 원본 PDF를 권장합니다</li>
                                <li>• 업로드 후 AI가 문서를 학습하는 데 약간의 시간이 소요됩니다</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Manage Tab */}
                {activeTab === 'manage' && (
                    <div className="space-y-4">
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4">학습된 문서 관리</h2>

                            {isLoadingStats ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    문서 정보를 불러오는 중...
                                </div>
                            ) : stats && stats.totalChunks > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted/30 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-primary">{stats.totalChunks}</p>
                                            <p className="text-sm text-muted-foreground">총 청크 수</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-xl text-center">
                                            <p className="text-3xl font-bold text-primary">{stats.sources.length}</p>
                                            <p className="text-sm text-muted-foreground">문서 수</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <h3 className="text-sm font-medium mb-2">업로드된 문서</h3>
                                        <div className="space-y-2">
                                            {stats.sources.map((source, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm"
                                                >
                                                    <Database className="w-4 h-4 text-muted-foreground" />
                                                    {source}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <Button
                                            variant="danger"
                                            onClick={handleClearDocuments}
                                            isLoading={isClearing}
                                            leftIcon={<Trash2 className="w-4 h-4" />}
                                            className="w-full"
                                        >
                                            모든 문서 삭제
                                        </Button>
                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            ⚠️ 삭제 후에는 복구할 수 없습니다
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Database className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>아직 학습된 문서가 없습니다</p>
                                    <p className="text-sm">문서 업로드 탭에서 PDF를 업로드해주세요</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
