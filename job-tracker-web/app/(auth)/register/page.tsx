"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [extensionAuthSuccess, setExtensionAuthSuccess] = useState(false);

    // Check if this is an extension auth flow
    const extensionId = searchParams.get("ext");
    const isExtensionAuth = !!extensionId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            // If this is extension auth flow, send token to extension
            if (isExtensionAuth && extensionId) {
                try {
                    // @ts-ignore - chrome is available in browser
                    chrome.runtime.sendMessage(
                        extensionId,
                        { type: 'AUTH_TOKEN', token: data.token },
                        (response: any) => {
                            if (response?.success) {
                                setExtensionAuthSuccess(true);
                                // Auto-close tab after 2 seconds
                                setTimeout(() => {
                                    window.close();
                                }, 2000);
                            } else {
                                throw new Error('Failed to authenticate extension');
                            }
                        }
                    );
                } catch (err) {
                    console.error('Extension auth failed:', err);
                    setError('Extension authentication failed. Please try logging in from the extension popup.');
                }
            } else {
                // Normal web registration flow
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("userEmail", email);
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Show success message for extension auth
    if (extensionAuthSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">✅ Registration Successful</CardTitle>
                        <CardDescription className="text-center">
                            Your extension is now connected!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 text-green-700 rounded-md">
                                <p className="font-medium">Account created and extension authenticated</p>
                                <p className="text-sm mt-2">This tab will close automatically...</p>
                            </div>
                            <Button 
                                onClick={() => window.close()} 
                                variant="outline"
                                className="w-full"
                            >
                                Close Tab
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        {isExtensionAuth ? "Register for Extension" : "Register"}
                    </CardTitle>
                    <CardDescription>
                        {isExtensionAuth 
                            ? "Create an account to connect your JobTracker extension" 
                            : "Create a new job tracker account"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isExtensionAuth && (
                            <div className="p-3 text-sm text-blue-600 bg-blue-50 rounded-md border border-blue-200">
                                <p className="font-medium">🔗 Extension Authentication</p>
                                <p className="text-xs mt-1">
                                    After registration, your extension will be automatically connected.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Register"}
                        </Button>

                        {!isExtensionAuth && (
                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-600 hover:underline">
                                    Login
                                </Link>
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
