'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/utils/auth';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (token) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
}
