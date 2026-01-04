"use client";

import Link from "next/link";
import { useState } from "react";
import { SocialButton } from "@/components/ui/SocialButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSocialLogin = (provider: 'kakao' | 'naver') => {
        window.location.href = `${API_BASE_URL}/api/auth/${provider}`;
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEmailLoading(true);
        setError("");

        try {
            const data = await api.post<{ accessToken: string }>('/auth/login', { email, password });
            await login(data.accessToken);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "로그인 정보를 확인해주세요.");
        } finally {
            setIsEmailLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
                    {/* Brand Logo Area */}
                    <div className="flex flex-col items-center space-y-4 mb-4 text-center">
                        <div className="bg-white/90 p-6 rounded-3xl shadow-2xl mb-4">
                            <img src="/logo.png" alt="School It" className="h-24 w-auto object-contain" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                            선생님과 학교를 잇는<br />가장 스마트한 방법
                        </p>
                    </div>

                    {/* Login Form Area */}
                    <div className="w-full space-y-6 bg-slate-800/50 p-8 rounded-[32px] border border-white/5 backdrop-blur-xl shadow-2xl">
                        {/* Email Login Form */}
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div className="space-y-2">
                                <input
                                    type="email"
                                    placeholder="이메일 주소"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-400 text-center font-medium animate-shake">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isEmailLoading}
                                className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isEmailLoading ? "로그인 중..." : "이메일 로그인"}
                            </button>
                        </form>

                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">또는 간편 로그인</span>
                            <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-1 gap-3">
                            <SocialButton
                                provider="kakao"
                                onClick={() => handleSocialLogin('kakao')}
                            />
                            <SocialButton
                                provider="naver"
                                onClick={() => handleSocialLogin('naver')}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-[11px] text-slate-500 text-center leading-relaxed font-medium">
                        <p>계속 진행하면 <Link href="/terms" className="text-slate-400 underline decoration-slate-600 cursor-pointer hover:text-white">이용약관</Link> 및</p>
                        <p><Link href="/privacy" className="text-slate-400 underline decoration-slate-600 cursor-pointer hover:text-white">개인정보 처리방침</Link>에 동의하게 됩니다.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
