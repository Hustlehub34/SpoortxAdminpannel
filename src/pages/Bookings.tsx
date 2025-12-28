import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockBookings, Booking, addAuditLog } from '@/lib/mockData';
import { Search, Filter, Calendar, Clock, MapPin, User, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { turfService, ApiBooking } from '@/services/turfService';

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const apiBookings = await turfService.getBookings();

      // Transform API data to match Booking interface
      const transformedBookings: Booking[] = apiBookings.map((apiBooking: ApiBooking) => ({
        id: apiBooking.bookingNumber,
        userId: `user_${apiBooking.userId}`,
        userName: apiBooking.userName,
        userPhone: apiBooking.userMobile,
        turfId: `turf_${apiBooking.turfId}`,
        turfName: apiBooking.turfName,
        sport: apiBooking.sportName,
        date: parseISO(apiBooking.bookingDate),
        time: `${apiBooking.startTime.substring(0, 5)} - ${apiBooking.endTime.substring(0, 5)}`,
        duration: Math.round(apiBooking.durationHours * 10) / 10, // Round to 1 decimal
        amount: apiBooking.totalAmount,
        paymentMethod: apiBooking.paymentStatus === 'Pending' ? 'Pending' : 'Online',
        transactionId: `TXN${apiBooking.bookingId.toString().padStart(8, '0')}`,
        status: mapApiStatusToLocal(apiBooking.bookingStatus),
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings. Please try again.');
      // Fall back to mock data if API fails
      setBookings(mockBookings);
    } finally {
      setIsLoading(false);
    }
  };

  // Map API status to local status format
  const mapApiStatusToLocal = (apiStatus: string): Booking['status'] => {
    const statusMap: Record<string, Booking['status']> = {
      'Pending': 'confirmed',
      'Confirmed': 'confirmed',
      'Cancelled': 'cancelled',
      'Completed': 'confirmed',
      'Refunded': 'refunded',
      'No-Show': 'no-show',
    };
    return statusMap[apiStatus] || 'confirmed';
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)));
    addAuditLog('Update Booking Status', `Changed booking ${bookingId} status to ${status}`);
    toast.success(`Booking ${status}`);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'refunded':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'no-show':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.turfName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bookings Management</h1>
          <p className="text-muted-foreground">View and manage all turf bookings</p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking ID, user, or turf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Booking Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{booking.id}</h3>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span className="font-medium text-foreground">{booking.userName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.turfName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        <p className="font-medium text-sm">{format(booking.date, 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time</p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        <p className="font-medium text-sm">{booking.time}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sport</p>
                      <Badge variant="outline">{booking.sport}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Amount</p>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-success" />
                        <p className="font-bold text-sm text-success">₹{booking.amount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">{booking.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono text-xs">{booking.transactionId}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => toast.info('Viewing booking details...')}
                  >
                    View Details
                  </Button>
                  {booking.status === 'confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        Cancel Booking
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => updateBookingStatus(booking.id, 'no-show')}
                      >
                        Mark No-Show
                      </Button>
                    </>
                  )}
                  {booking.status === 'cancelled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => updateBookingStatus(booking.id, 'refunded')}
                    >
                      Process Refund
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          </div>
        )}

        {!isLoading && filteredBookings.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Bookings;
