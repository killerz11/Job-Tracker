"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

import { DashboardStats } from "@/components/DashboardStats";
import { JobFilters } from "@/components/JobFilters";
import { JobsTable } from "@/components/JobsTable";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Filter state (managed by parent, passed to children)
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  
  // Stats state (for DashboardStats component)
  const [totalJobs, setTotalJobs] = useState(0);
  const [stats, setStats] = useState({
    applied: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  });

  // Fetch total stats once on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch all jobs to calculate stats (you could also create a separate stats endpoint)
        const data = await apiFetch("/api/jobs?page=1&limit=1000");
        const allJobs = data.jobs || [];
        
        setTotalJobs(data.total || allJobs.length);
        setStats({
          applied: allJobs.filter((j: any) => j.status === "APPLIED").length,
          interview: allJobs.filter((j: any) => j.status === "INTERVIEW").length,
          selected: allJobs.filter((j: any) => j.status === "OFFER").length,
          rejected: allJobs.filter((j: any) => j.status === "REJECTED").length,
        });
      } catch (err) {
        console.error("Error loading stats:", err);
        localStorage.removeItem("authToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [router]);

  const resetFilters = () => {
    setStatusFilter("ALL");
    setPlatformFilter("ALL");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-10">
      {/* Summary Cards - Static, only re-renders when stats change */}
      <DashboardStats totalJobs={totalJobs} stats={stats} />

      {/* Filters - Static, only re-renders when filter values change */}
      <JobFilters
        statusFilter={statusFilter}
        platformFilter={platformFilter}
        onStatusChange={setStatusFilter}
        onPlatformChange={setPlatformFilter}
        onReset={resetFilters}
      />

      {/* Jobs Table - Dynamic, re-fetches when filters or page changes */}
      <JobsTable
        statusFilter={statusFilter}
        platformFilter={platformFilter}
      />
    </div>
  );
}
