import AdminLayout from '@/components/AdminLayout';
import PhotoCarousel from '@/components/PhotoCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTurfs, mockTurfOwners, mockBookings } from '@/lib/mockData';
import { MapPin, TrendingUp, DollarSign, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

const Analytics = () => {
  // Calculate 7-day metrics for each turf
  const getTurf7DayMetrics = (turfId: string) => {
    const turfBookings = mockBookings.filter((b) => b.turfId === turfId);
    const totalBookings = turfBookings.length;
    const totalRevenue = turfBookings.reduce((sum, b) => sum + b.amount, 0);
    
    // Mock settlement amount (80% of revenue after platform fee)
    const settlementAmount = totalRevenue * 0.8;
    
    return {
      totalBookings,
      totalRevenue,
      settlementAmount,
    };
  };

  const getOwnerName = (ownerId: string) => {
    const owner = mockTurfOwners.find((o) => o.id === ownerId);
    return owner?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.success(`Exporting 7-day analytics as ${format.toUpperCase()}...`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">7-Day Analytics</h1>
            <p className="text-muted-foreground">Track bookings and settlements for each turf (Last 7 Days)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Turfs Analytics Grid */}
        <div className="space-y-6">
          {mockTurfs.map((turf) => {
            const metrics = getTurf7DayMetrics(turf.id);
            
            return (
              <Card
                key={turf.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                  {/* Photo Carousel - Left */}
                  <div className="lg:col-span-4">
                    <PhotoCarousel images={turf.images} alt={turf.name} />
                  </div>

                  {/* Turf Details - Middle */}
                  <div className="lg:col-span-4 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{turf.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{turf.city}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(turf.status)}>{turf.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{turf.address}</p>
                    </div>

                    {/* Sports Tags */}
                    <div className="flex flex-wrap gap-2">
                      {turf.sports.map((sport) => (
                        <Badge key={sport} variant="outline" className="bg-secondary/50">
                          {sport}
                        </Badge>
                      ))}
                    </div>

                    {/* Owner Info */}
                    <div className="p-4 bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-xl border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Owner</p>
                      <p className="font-semibold">{getOwnerName(turf.ownerId)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{turf.ownerId}</p>
                    </div>
                  </div>

                  {/* 7-Day Metrics - Right */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Bookings (7d)</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground mb-1">{metrics.totalBookings}</p>
                      <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-success" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Revenue (7d)</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground mb-1">
                        ₹{(metrics.totalRevenue / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-muted-foreground">Gross earnings</p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl border border-warning/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-5 h-5 text-warning" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Settlement Amount (7d)</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground mb-1">
                        ₹{(metrics.settlementAmount / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-success">After 20% platform fee</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
