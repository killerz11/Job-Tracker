"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

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

import { JobsPagination } from "@/components/JobsPagination";

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

interface JobsTableProps {
  statusFilter: string;
  platformFilter: string;
}

export function JobsTable({ statusFilter, platformFilter }: JobsTableProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch jobs when filters or page changes
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const data = await apiFetch(`/api/jobs?page=${currentPage}&limit=${itemsPerPage}`);
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error loading jobs:", err);
        localStorage.removeItem("authToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [router, currentPage]);

  // Filter jobs based on selected filters (client-side)
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;
      const matchesPlatform = platformFilter === "ALL" || job.platform === platformFilter;
      return matchesStatus && matchesPlatform;
    });
  }, [jobs, statusFilter, platformFilter]);

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

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Jobs Table */}
      <Card className="border-2">
        <CardContent className="p-0">
          {filteredJobs.length === 0 ? (
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
      {/* Pagination - Show based on total pages, not filtered results */}
      <JobsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
