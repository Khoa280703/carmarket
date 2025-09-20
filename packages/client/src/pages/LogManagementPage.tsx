import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  User,
  AlertTriangle,
  Info,
  Bug,
  Trash2,
} from "lucide-react";
import { formatRelativeTime } from "../lib/utils";
import { LogsService } from "../services/logs.service";
import toast from "react-hot-toast";

interface LogEntry {
  id: string;
  level: "info" | "warning" | "error" | "debug";
  category: string;
  message: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  targetUserId?: string;
  listingId?: string;
  conversationId?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  targetUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface LogStats {
  totalLogs: number;
  logsByLevel: Array<{ level: string; count: string }>;
  logsByCategory: Array<{ category: string; count: string }>;
  recentActivity: LogEntry[];
}

const LogManagementPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filters, setFilters] = useState({
    level: "",
    category: "",
    search: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const levelColors = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    debug: "bg-gray-100 text-gray-800",
  };

  const levelIcons = {
    info: Info,
    warning: AlertTriangle,
    error: Bug,
    debug: Bug,
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Convert "all" values to empty strings for API
      const apiFilters = {
        ...filters,
        level: filters.level === "all" ? "" : filters.level,
        category: filters.category === "all" ? "" : filters.category,
      };
      const data = await LogsService.getLogs(apiFilters);

      setLogs(data.logs);
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch (error) {
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await LogsService.getLogStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const exportLogs = async () => {
    try {
      // Convert "all" values to empty strings for API
      const apiFilters = {
        ...filters,
        level: filters.level === "all" ? "" : filters.level,
        category: filters.category === "all" ? "" : filters.category,
      };
      const blob = await LogsService.exportLogs(apiFilters);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Logs exported successfully");
    } catch (error) {
      toast.error("Failed to export logs");
    }
  };

  const cleanupOldLogs = async () => {
    if (!confirm("Are you sure you want to delete logs older than 90 days?")) {
      return;
    }

    try {
      const data = await LogsService.cleanupOldLogs(90);

      toast.success(data.message);
      fetchLogs();
      fetchStats();
    } catch (error) {
      toast.error("Failed to cleanup old logs");
    }
  };

  const getLevelIcon = (level: string) => {
    const IconComponent = levelIcons[level as keyof typeof levelIcons] || Info;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Log Management</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage system activity logs
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalLogs.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Error Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.logsByLevel.find((l) => l.level === "error")?.count ||
                  "0"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Warning Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.logsByLevel.find((l) => l.level === "warning")?.count ||
                  "0"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Info Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.logsByLevel.find((l) => l.level === "info")?.count ||
                  "0"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <Select
                value={filters.level}
                onValueChange={(value) => handleFilterChange("level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="user_action">User Action</SelectItem>
                  <SelectItem value="listing_action">Listing Action</SelectItem>
                  <SelectItem value="admin_action">Admin Action</SelectItem>
                  <SelectItem value="system_event">System Event</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="favorite">Favorite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={fetchLogs} disabled={loading} className="flex-1">
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={cleanupOldLogs}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Cleanup Old Logs
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {logs.length} of {pagination.total} logs
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Loading logs...</p>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge className={levelColors[log.level]}>
                        <div className="flex items-center gap-1">
                          {getLevelIcon(log.level)}
                          {log.level.toUpperCase()}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {log.category.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium truncate">
                          {log.message}
                        </p>
                        {log.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {log.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <div className="text-sm">
                          <p className="font-medium">
                            {log.user.firstName} {log.user.lastName}
                          </p>
                          <p className="text-gray-500">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatRelativeTime(log.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Log Details</DialogTitle>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Level
                                  </label>
                                  <Badge
                                    className={levelColors[selectedLog.level]}
                                  >
                                    {selectedLog.level.toUpperCase()}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Category
                                  </label>
                                  <p className="text-sm">
                                    {selectedLog.category.replace("_", " ")}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Message
                                </label>
                                <p className="text-sm">{selectedLog.message}</p>
                              </div>

                              {selectedLog.description && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Description
                                  </label>
                                  <p className="text-sm">
                                    {selectedLog.description}
                                  </p>
                                </div>
                              )}

                              {selectedLog.metadata && (
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Metadata
                                  </label>
                                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                    {JSON.stringify(
                                      selectedLog.metadata,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    Created At
                                  </label>
                                  <p className="text-sm">
                                    {new Date(
                                      selectedLog.createdAt
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                {selectedLog.ipAddress && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      IP Address
                                    </label>
                                    <p className="text-sm font-mono">
                                      {selectedLog.ipAddress}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogManagementPage;
