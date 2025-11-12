'use client';

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MyPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/blogs/design-analysis-and-algorithm/introduction')
    }, [router])

    return null
}