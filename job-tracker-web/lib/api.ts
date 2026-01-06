// Fallback to production URL if env var is not set
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== "undefined" && window.location.hostname !== "localhost" 
        ? "https://humorous-solace-production.up.railway.app" 
        : "http://localhost:4000");
export async function apiFetch(
    path: string,
    options: RequestInit = {}
){
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        cache: 'no-store', // Disable caching
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`}: {}),
            ...options.headers,
        },
    });

    if(!res.ok){
        throw new Error("API request failed");
    }

    return res.json();
}