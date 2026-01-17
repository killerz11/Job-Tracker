"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

import { Card, CardContent } from "@/components/ui/card";

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
  const [fetching, setFetching] = useState(false); // Separate state for filter changes
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({ statusFilter, platformFilter });

  // Fetch jobs when filters or page changes
  useEffect(() => {
    const loadJobs = async () => {
      // Check if filters changed
      const filtersChanged =
        prevFiltersRef.current.statusFilter !== statusFilter ||
        prevFiltersRef.current.platformFilter !== platformFilter;

      // If filters changed and not on page 1, reset to page 1 and skip this fetch
      if (filtersChanged && currentPage !== 1) {
        prevFiltersRef.current = { statusFilter, platformFilter };
        setCurrentPage(1);
        return; // Don't fetch with old page number
      }

      // Update previous filter values
      prevFiltersRef.current = { statusFilter, platformFilter };

      // Only show full loading spinner on initial load
      // For filter changes, keep showing previous data until new data arrives
      if (jobs.length === 0) {
        setLoading(true);
      } else {
        setFetching(true); // Show subtle loading indicator for filters
      }
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        // Build query params
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });

        // Add platform filter if not ALL
        if (platformFilter && platformFilter !== "ALL") {
          params.append("platform", platformFilter);
        }

        // Add status filter if not ALL
        if (statusFilter && statusFilter !== "ALL") {
          params.append("status", statusFilter);
        }

        const data = await apiFetch(`/api/jobs?${params.toString()}`);
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error loading jobs:", err);
        localStorage.removeItem("authToken");
        router.push("/login");
      } finally {
        setLoading(false);
        setFetching(false);
      }
    };

    loadJobs();
  }, [router, currentPage, platformFilter, statusFilter]); // Add statusFilter to dependencies

  // Remove client-side filtering entirely since both filters are now server-side
  const filteredJobs = jobs; // Use jobs directly

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
          job.id === jobId
            ? { ...job, status: newStatus as Job["status"] }
            : job
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
        {/* Show loading indicator when fetching filtered results */}
        {fetching && (
          <div className="absolute right-4 top-4 z-10">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        )}
        <CardContent className="p-0 relative">
          {/* Dim content slightly while fetching */}
          <div className={fetching ? "opacity-50 transition-opacity" : ""}>
            {filteredJobs.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No applications found.
              </div>
            ) : (
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-gray-300 bg-gray-100 font-semibold">
                      Company
                    </TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-semibold">
                      Role
                    </TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-semibold">
                      Location
                    </TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-semibold">
                      Platform
                    </TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-semibold">
                      Applied
                    </TableHead>
                    <TableHead className="border border-gray-300 bg-gray-100 font-semibold">
                      Link
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="border border-gray-300 font-semibold">
                        {job.companyName}
                      </TableCell>

                      <TableCell className="border border-gray-300">
                        {job.jobTitle}
                      </TableCell>

                      <TableCell className="border border-gray-300">
                        {job.location || "-"}
                      </TableCell>

                      <TableCell className="uppercase text-xs border border-gray-300">
                        {job.platform}
                      </TableCell>

                      <TableCell className="border border-gray-300">
                        <Select
                          value={job.status}
                          onValueChange={(value: string) =>
                            updateJobStatus(job.id, value)
                          }
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
          </div>
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
