const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export async function apiFetch(
    path: string,
    options: RequestInit = {}
){
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `bearer ${token}`}: {}),
            ...options.headers,
        },
    });

    if(!res.ok){
        throw new Error("API request failed");
    }

    return res.json();
}