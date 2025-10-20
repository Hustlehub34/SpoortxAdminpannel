import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PhotoCarousel from '@/components/PhotoCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTurfs, mockTurfOwners, Turf, addAuditLog } from '@/lib/mockData';
import { Edit, CheckCircle, XCircle, Key, MapPin, TrendingUp, DollarSign, Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';

const Turfs = () => {
  const [turfs, setTurfs] = useState<Turf[]>(mockTurfs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTurfData, setNewTurfData] = useState({
    name: '',
    city: '',
    address: '',
    ownerId: '',
    sports: [] as string[],
  });

  const updateTurfStatus = (turfId: string, status: Turf['status']) => {
    setTurfs(turfs.map((t) => (t.id === turfId ? { ...t, status } : t)));
    addAuditLog('Update Turf Status', `Changed turf ${turfId} status to ${status}`);
    toast.success(`Turf status updated to ${status}`);
  };

  const handleAddTurf = () => {
    if (!newTurfData.name || !newTurfData.city || !newTurfData.ownerId) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const newTurf: Turf = {
      id: `turf_${Date.now()}`,
      name: newTurfData.name,
      ownerId: newTurfData.ownerId,
      city: newTurfData.city,
      address: newTurfData.address,
      sports: newTurfData.sports.length > 0 ? newTurfData.sports : ['Football'],
      images: ['/placeholder.svg'],
      status: 'pending',
      totalBookings30d: 0,
      revenue30d: 0,
      pendingSettlements: 0,
      pricing: [{ sport: 'Football', pricePerHour: 1500 }],
      availableSlots: ['06:00-08:00', '08:00-10:00', '10:00-12:00', '18:00-20:00', '20:00-22:00'],
      cancellationPolicy: 'Free cancellation up to 24 hours before booking',
    };

    setTurfs([newTurf, ...turfs]);
    addAuditLog('Add New Turf', `Created turf: ${newTurf.name}`);
    toast.success('New turf added successfully');
    setDialogOpen(false);
    setNewTurfData({ name: '', city: '', address: '', ownerId: '', sports: [] });
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-4 h-4" />
                Add New Turf
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Turf</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Turf Name *</Label>
                  <Input
                    id="name"
                    value={newTurfData.name}
                    onChange={(e) => setNewTurfData({ ...newTurfData, name: e.target.value })}
                    placeholder="Enter turf name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner *</Label>
                  <Select
                    value={newTurfData.ownerId}
                    onValueChange={(value) => setNewTurfData({ ...newTurfData, ownerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTurfOwners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={newTurfData.city}
                    onChange={(e) => setNewTurfData({ ...newTurfData, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newTurfData.address}
                    onChange={(e) => setNewTurfData({ ...newTurfData, address: e.target.value })}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sports">Sports (comma separated)</Label>
                  <Input
                    id="sports"
                    placeholder="e.g. Football, Cricket, Basketball"
                    onChange={(e) => setNewTurfData({ ...newTurfData, sports: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
                <Button onClick={handleAddTurf} className="w-full">
                  Add Turf
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
