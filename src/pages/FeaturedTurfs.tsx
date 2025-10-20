import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PhotoCarousel from '@/components/PhotoCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { mockTurfs, mockTurfOwners, addAuditLog } from '@/lib/mockData';
import { Star, MapPin, TrendingUp, Plus, X, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface FeaturedTurf {
  turfId: string;
  position: number;
  badge: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const FeaturedTurfs = () => {
  const [featuredTurfs, setFeaturedTurfs] = useState<FeaturedTurf[]>([
    {
      turfId: 'turf_001',
      position: 1,
      badge: '#1 Featured',
      startDate: '2025-10-20',
      endDate: '2025-11-20',
      active: true,
    },
    {
      turfId: 'turf_002',
      position: 2,
      badge: 'Top Pick',
      startDate: '2025-10-20',
      endDate: '2025-11-20',
      active: true,
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFeatured, setNewFeatured] = useState({
    turfId: '',
    badge: '',
    startDate: '',
    endDate: '',
  });

  const getTurfDetails = (turfId: string) => {
    return mockTurfs.find((t) => t.id === turfId);
  };

  const getOwnerName = (ownerId: string) => {
    const owner = mockTurfOwners.find((o) => o.id === ownerId);
    return owner?.name || 'Unknown';
  };

  const availableTurfs = mockTurfs.filter(
    (turf) => !featuredTurfs.find((ft) => ft.turfId === turf.id)
  );

  const handleAddFeatured = () => {
    if (!newFeatured.turfId || !newFeatured.badge || !newFeatured.startDate || !newFeatured.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    const featured: FeaturedTurf = {
      turfId: newFeatured.turfId,
      position: featuredTurfs.length + 1,
      badge: newFeatured.badge,
      startDate: newFeatured.startDate,
      endDate: newFeatured.endDate,
      active: true,
    };

    setFeaturedTurfs([...featuredTurfs, featured]);
    const turf = getTurfDetails(newFeatured.turfId);
    addAuditLog('Add Featured Turf', `Added ${turf?.name} as featured with badge: ${newFeatured.badge}`);
    toast.success('Turf added to featured list');
    setDialogOpen(false);
    setNewFeatured({ turfId: '', badge: '', startDate: '', endDate: '' });
  };

  const handleRemoveFeatured = (turfId: string) => {
    const turf = getTurfDetails(turfId);
    setFeaturedTurfs(featuredTurfs.filter((ft) => ft.turfId !== turfId));
    addAuditLog('Remove Featured Turf', `Removed ${turf?.name} from featured list`);
    toast.success('Turf removed from featured list');
  };

  const handleToggleActive = (turfId: string) => {
    setFeaturedTurfs(
      featuredTurfs.map((ft) =>
        ft.turfId === turfId ? { ...ft, active: !ft.active } : ft
      )
    );
    const turf = getTurfDetails(turfId);
    const newStatus = !featuredTurfs.find((ft) => ft.turfId === turfId)?.active;
    addAuditLog('Toggle Featured Status', `${newStatus ? 'Activated' : 'Deactivated'} ${turf?.name}`);
    toast.success(`Featured status ${newStatus ? 'activated' : 'deactivated'}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Featured Turfs</h1>
            <p className="text-muted-foreground">Manage promotional and #1 rated turfs</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-4 h-4" />
                Add Featured Turf
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Featured Turf</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="turf">Select Turf *</Label>
                  <Select value={newFeatured.turfId} onValueChange={(value) => setNewFeatured({ ...newFeatured, turfId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose turf" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTurfs.map((turf) => (
                        <SelectItem key={turf.id} value={turf.id}>
                          {turf.name} - {turf.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge Text *</Label>
                  <Input
                    id="badge"
                    value={newFeatured.badge}
                    onChange={(e) => setNewFeatured({ ...newFeatured, badge: e.target.value })}
                    placeholder="e.g. #1 Featured, Top Pick, Premium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Date *</Label>
                    <Input
                      id="start"
                      type="date"
                      value={newFeatured.startDate}
                      onChange={(e) => setNewFeatured({ ...newFeatured, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Date *</Label>
                    <Input
                      id="end"
                      type="date"
                      value={newFeatured.endDate}
                      onChange={(e) => setNewFeatured({ ...newFeatured, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddFeatured} className="w-full">
                  Add to Featured
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Featured Turfs List */}
        <div className="space-y-6">
          {featuredTurfs.map((featured) => {
            const turf = getTurfDetails(featured.turfId);
            if (!turf) return null;

            return (
              <Card
                key={featured.turfId}
                className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  featured.active ? 'bg-gradient-to-br from-card to-card/50 border-primary/30' : 'opacity-60'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                  {/* Photo Carousel */}
                  <div className="lg:col-span-4 relative">
                    <PhotoCarousel images={turf.images} alt={turf.name} />
                    {featured.active && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-warning to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                        <Trophy className="w-3 h-3" />
                        {featured.badge}
                      </div>
                    )}
                  </div>

                  {/* Turf Details */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-foreground">{turf.name}</h3>
                            <Badge className="bg-warning/20 text-warning border-warning/40">
                              Position #{featured.position}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{turf.city}</span>
                          </div>
                        </div>
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
                    </div>
                  </div>

                  {/* Featured Details & Actions */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground uppercase">Featured Badge</p>
                      </div>
                      <p className="text-xl font-bold text-foreground mb-2">{featured.badge}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Start: {new Date(featured.startDate).toLocaleDateString()}</p>
                        <p>End: {new Date(featured.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-2">Performance</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Bookings (30d)</span>
                          <span className="font-semibold text-sm">{turf.totalBookings30d}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Revenue (30d)</span>
                          <span className="font-semibold text-sm text-success">
                            ₹{(turf.revenue30d / 1000).toFixed(1)}K
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant={featured.active ? 'outline' : 'default'}
                        size="sm"
                        className="w-full"
                        onClick={() => handleToggleActive(featured.turfId)}
                      >
                        {featured.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:bg-destructive/10 gap-2"
                        onClick={() => handleRemoveFeatured(featured.turfId)}
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </Button>
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

export default FeaturedTurfs;
