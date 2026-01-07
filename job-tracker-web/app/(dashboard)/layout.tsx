"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Briefcase, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/lib/api";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string>("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Check if user is authenticated
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.push("/login");
            return;
        }
        
        const fetchUser = async () => {
            try {
                const data = await apiFetch("/api/auth/me");
                // Assuming the API returns user info, adjust based on your actual API
                setUserEmail(localStorage.getItem("userEmail") || "user@example.com");
            } catch (err) {
                console.error("Failed to fetch user:", err);
                // If auth fails, redirect to login
                localStorage.removeItem("authToken");
                localStorage.removeItem("userEmail");
                router.push("/login");
            }
        };
        fetchUser();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Tracker
                </h1>
                
                <div className="flex items-center gap-4">
                    {mounted && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2">
                                    <User className="h-4 w-4" />
                                    Profile
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    {userEmail}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>
                <main className="w-full flex justify-center">
        <div className="w-full px-10 py-6">
            {children}
        </div>
    </main>

        </div>
    );
}
