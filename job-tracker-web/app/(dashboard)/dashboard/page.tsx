"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";

import { apiFetch } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type Job = {
  id: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  jobUrl: string;
  platform: "LINKEDIN" | "NAUKRI" | "INTERNSHALA";
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const data = await apiFetch("/api/jobs");
        setJobs(data.jobs);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("authToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [router]);

  // Filter jobs based on selected filters
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;
      const matchesPlatform = platformFilter === "ALL" || job.platform === platformFilter;
      return matchesStatus && matchesPlatform;
    });
  }, [jobs, statusFilter, platformFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter((j) => j.status === "APPLIED").length,
      interview: jobs.filter((j) => j.status === "INTERVIEW").length,
      offer: jobs.filter((j) => j.status === "OFFER").length,
      rejected: jobs.filter((j) => j.status === "REJECTED").length,
    };
  }, [jobs]);

  // Update job status
  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      await apiFetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      // Update local state
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: newStatus as Job["status"] } : job
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interview}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offer}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block px-2">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="APPLIED">Applied</SelectItem>
                <SelectItem value="INTERVIEW">Interview</SelectItem>
                <SelectItem value="OFFER">Offer</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block px-2">Platform</label>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Platforms</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="NAUKRI">Naukri</SelectItem>
                <SelectItem value="INTERNSHALA">Internshala</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>

      {/* Jobs Table */}
      <Card className="border-2">
        <CardContent className="p-0">{filteredJobs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No applications found.
            </div>
          ) : (
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Company</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Role</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Location</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Platform</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Status</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Applied</TableHead>
                  <TableHead className="border border-gray-300 bg-gray-100 font-semibold">Link</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="border border-gray-300 font-semibold">
                      {job.companyName}
                    </TableCell>

                    <TableCell className="border border-gray-300">{job.jobTitle}</TableCell>

                    <TableCell className="border border-gray-300">{job.location || "-"}</TableCell>

                    <TableCell className="uppercase text-xs border border-gray-300">
                      {job.platform}
                    </TableCell>

                    <TableCell className="border border-gray-300">
                      <Select
                        value={job.status}
                        onValueChange={(value: string) => updateJobStatus(job.id, value)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPLIED">Applied</SelectItem>
                          <SelectItem value="INTERVIEW">Interview</SelectItem>
                          <SelectItem value="OFFER">Offer</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-xs border border-gray-300">
                      {new Date(job.appliedAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-xs border border-gray-300">
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


