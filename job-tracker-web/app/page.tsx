"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("authToken");
        if (token) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center">
            <h1 className="text-3xl font-bold">
                Job Application Tracker
            </h1>
        </main>
    );
}
