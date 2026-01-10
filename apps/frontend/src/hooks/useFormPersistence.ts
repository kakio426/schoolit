import { useEffect, useState } from 'react';

export function useFormPersistence<T>(key: string, initialValues: T) {
    const [values, setValues] = useState<T>(initialValues);
    const [isHydrated, setIsHydrated] = useState(false);

    // 1. 초기 로드: 로컬 스토리지 확인
    useEffect(() => {
        // 서버 사이드 렌더링 시 실행 방지
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                setValues(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved form data', e);
            }
        }
        setIsHydrated(true);
    }, [key]);

    // 2. 변경 시 자동 저장
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(key, JSON.stringify(values));
        }
    }, [key, values, isHydrated]);

    // 3. 완료 시 삭제 헬퍼
    const clearSavedData = () => {
        localStorage.removeItem(key);
        // 선택적: 초기값으로 리셋하려면 아래 주석 해제
        // setValues(initialValues); 
    };

    return { values, setValues, clearSavedData, isHydrated };
}
