import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PhotoCarousel from '@/components/PhotoCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTurfs, mockTurfOwners, Turf, addAuditLog } from '@/lib/mockData';
import { Edit, CheckCircle, XCircle, Key, MapPin, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Turfs = () => {
  const [turfs, setTurfs] = useState<Turf[]>(mockTurfs);

  const updateTurfStatus = (turfId: string, status: Turf['status']) => {
    setTurfs(turfs.map((t) => (t.id === turfId ? { ...t, status } : t)));
    addAuditLog('Update Turf Status', `Changed turf ${turfId} status to ${status}`);
    toast.success(`Turf status updated to ${status}`);
  };

  const getOwnerName = (ownerId: string) => {
    const owner = mockTurfOwners.find((o) => o.id === ownerId);
    return owner?.name || 'Unknown';
  };

  const getStatusColor = (status: Turf['status']) => {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Turf Management</h1>
            <p className="text-muted-foreground">View and manage all turfs in the system</p>
          </div>
        </div>

        {/* Turfs Grid */}
        <div className="space-y-6">
          {turfs.map((turf) => (
            <Card
              key={turf.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                {/* Photo Carousel - Left */}
                <div className="lg:col-span-4">
                  <PhotoCarousel images={turf.images} alt={turf.name} />
                </div>

                {/* Turf Details - Middle */}
                <div className="lg:col-span-5 space-y-4">
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
                      <Badge key={sport} variant="outline" className="bg-secondary">
                        {sport}
                      </Badge>
                    ))}
                  </div>

                  {/* Owner Info */}
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Owner</p>
                    <p className="font-medium text-sm">{getOwnerName(turf.ownerId)}</p>
                    <p className="text-xs text-muted-foreground">{turf.ownerId}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Details
                    </Button>
                    {turf.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => updateTurfStatus(turf.id, 'active')}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => updateTurfStatus(turf.id, 'inactive')}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="gap-2">
                      <Key className="w-4 h-4" />
                      Generate Report
                    </Button>
                  </div>
                </div>

                {/* KPIs - Right */}
                <div className="lg:col-span-3 space-y-3">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-xs font-medium text-muted-foreground">Total Bookings (30d)</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{turf.totalBookings30d}</p>
                    <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-success" />
                      <p className="text-xs font-medium text-muted-foreground">Revenue (30d)</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">₹{(turf.revenue30d / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground mt-1">+8% from last month</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl border border-warning/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-warning" />
                      <p className="text-xs font-medium text-muted-foreground">Pending Settlements</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{(turf.pendingSettlements / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Due for processing</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Turfs;
