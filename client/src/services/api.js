const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "API request failed");
    }

    return res.json();
};