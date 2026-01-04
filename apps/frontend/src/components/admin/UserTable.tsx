import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { User } from '@/types';
import { Role } from '@/lib/constants';

export const UserTable: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<{ data: User[], total: number }>(`/admin/users?page=${page}&limit=10&search=${search}`);
            setUsers(data.data);
            setTotalPages(Math.ceil(data.total / 10));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timeout);
    }, [page, search]);

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="이름 또는 이메일 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-3 bg-surface rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-primary/20 transition-all text-foreground"
                />
            </div>

            <div className="bg-surface rounded-3xl border border-slate-200/50 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-foreground-muted font-medium">
                            <tr>
                                <th className="px-6 py-4">사용자</th>
                                <th className="px-6 py-4">역할</th>
                                <th className="px-6 py-4">가입일</th>
                                <th className="px-6 py-4 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-foreground">{user.name}</div>
                                            <div className="text-xs text-foreground-muted">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${user.role === Role.TEACHER ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                            user.role === Role.SCHOOL ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-foreground-muted">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-foreground-muted hover:text-primary font-medium transition-colors">
                                            수정
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-foreground-muted">검색 결과가 없습니다.</div>
                )}
            </div>

            <div className="flex justify-center gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg bg-surface border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-surface-hover"
                >
                    이전
                </button>
                <span className="px-4 py-2 text-foreground font-medium">{page} / {totalPages || 1}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg bg-surface border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-surface-hover"
                >
                    다음
                </button>
            </div>
        </div>
    );
}
