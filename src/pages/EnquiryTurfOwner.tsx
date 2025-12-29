import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const BASE_URL = 'https://spoortx.onrender.com/api';

interface TurfOwnerRequest {
  requestId: number;
  ownerName: string;
  mobile: string;
  email: string;
  proposedTurfName: string;
  city: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string | null;
}

interface ApiResponse {
  code: number;
  status: boolean;
  message: string;
  data: {
    requests: TurfOwnerRequest[];
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
}

const EnquiryTurfOwner = () => {
  const [requests, setRequests] = useState<TurfOwnerRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TurfOwnerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TurfOwnerRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/admin/turf-owner-requests`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setRequests(data.data.requests);
      setFilteredRequests(data.data.requests);
      setStats({
        totalRequests: data.data.totalRequests,
        pendingRequests: data.data.pendingRequests,
        approvedRequests: data.data.approvedRequests,
        rejectedRequests: data.data.rejectedRequests,
      });
      toast.success(data.message);
    } catch (error) {
      console.error('Error fetching turf owner requests:', error);
      toast.error('Failed to load turf owner requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRequests(query, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterRequests(searchQuery, status);
  };

  const filterRequests = (query: string, status: string) => {
    let filtered = requests;

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((req) => req.status.toLowerCase() === status.toLowerCase());
    }

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.ownerName.toLowerCase().includes(lowerQuery) ||
          req.email.toLowerCase().includes(lowerQuery) ||
          req.mobile.includes(query) ||
          req.city.toLowerCase().includes(lowerQuery) ||
          req.proposedTurfName.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApproveClick = (request: TurfOwnerRequest) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (request: TurfOwnerRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);

      const response = await fetch(
        `${BASE_URL}/admin/turf-owner-requests/${selectedRequest.requestId}/approve`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            adminId: 1, // You can get this from logged in admin context
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.requestId === selectedRequest.requestId
            ? { ...req, status: 'Approved' as const, updatedAt: new Date().toISOString() }
            : req
        )
      );

      setFilteredRequests((prev) =>
        prev.map((req) =>
          req.requestId === selectedRequest.requestId
            ? { ...req, status: 'Approved' as const, updatedAt: new Date().toISOString() }
            : req
        )
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1,
        approvedRequests: prev.approvedRequests + 1,
      }));

      toast.success(`Request approved for ${selectedRequest.ownerName}`);
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setIsProcessing(true);

      const response = await fetch(
        `${BASE_URL}/admin/turf-owner-requests/${selectedRequest.requestId}/reject`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.requestId === selectedRequest.requestId
            ? { ...req, status: 'Rejected' as const, updatedAt: new Date().toISOString() }
            : req
        )
      );

      setFilteredRequests((prev) =>
        prev.map((req) =>
          req.requestId === selectedRequest.requestId
            ? { ...req, status: 'Rejected' as const, updatedAt: new Date().toISOString() }
            : req
        )
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1,
        rejectedRequests: prev.rejectedRequests + 1,
      }));

      toast.success(`Request rejected for ${selectedRequest.ownerName}`);
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (request: TurfOwnerRequest) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-success/10 text-success border-success/20 gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Turf Owner Requests</h1>
          <p className="text-muted-foreground">Manage turf owner registration requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'all' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleStatusFilter('all')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'pending' ? 'ring-2 ring-warning' : ''
            }`}
            onClick={() => handleStatusFilter('pending')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'approved' ? 'ring-2 ring-success' : ''
            }`}
            onClick={() => handleStatusFilter('approved')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approvedRequests}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'rejected' ? 'ring-2 ring-destructive' : ''
            }`}
            onClick={() => handleStatusFilter('rejected')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejectedRequests}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, city, or turf name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Requests List */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map((request) => (
              <Card
                key={request.requestId}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Header with Name and Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{request.ownerName}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">#{request.requestId}</span>
                  </div>

                  {/* Proposed Turf Name */}
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Proposed Turf:</span>
                    </div>
                    <p className="font-semibold text-foreground mt-1">{request.proposedTurfName}</p>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-foreground truncate">{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-foreground">{request.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-foreground">{request.city}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="w-3 h-3" />
                    <span>Submitted: {format(new Date(request.createdAt), 'MMM dd, yyyy hh:mm a')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(request)}
                    >
                      View Details
                    </Button>
                    {request.status === 'Pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90"
                          onClick={() => handleApproveClick(request)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(request)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRequests.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No requests found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No turf owner requests have been submitted yet'}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the turf owner request from "{selectedRequest?.ownerName}" for "
              {selectedRequest?.proposedTurfName}". The owner will be notified and can start setting
              up their turf.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              className="bg-success text-white hover:bg-success/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-muted-foreground">
                You are about to reject the request from:
              </p>
              <p className="font-semibold mt-1">{selectedRequest?.ownerName}</p>
              <p className="text-sm text-muted-foreground">
                Turf: {selectedRequest?.proposedTurfName}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection (e.g., Incomplete information provided, Invalid documents, etc.)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be sent to the turf owner.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Request ID</span>
                <span className="font-mono">#{selectedRequest.requestId}</span>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Owner Name</p>
                    <p className="font-semibold">{selectedRequest.ownerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Proposed Turf Name</p>
                    <p className="font-semibold">{selectedRequest.proposedTurfName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm">{selectedRequest.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Mobile</span>
                  <span className="text-sm">{selectedRequest.mobile}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">City</span>
                  <span className="text-sm">{selectedRequest.city}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Submitted On</span>
                  <span className="text-sm">
                    {format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy hh:mm a')}
                  </span>
                </div>
                {selectedRequest.updatedAt && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">
                      {format(new Date(selectedRequest.updatedAt), 'MMM dd, yyyy hh:mm a')}
                    </span>
                  </div>
                )}
              </div>

              {selectedRequest.status === 'Pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90 gap-2"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleApproveClick(selectedRequest);
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleRejectClick(selectedRequest);
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default EnquiryTurfOwner;
