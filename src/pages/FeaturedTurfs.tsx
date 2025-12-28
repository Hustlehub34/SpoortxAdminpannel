import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PhotoCarousel from '@/components/PhotoCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { addAuditLog } from '@/lib/mockData';
import { Star, MapPin, Plus, X, Trophy, Search } from 'lucide-react';
import { toast } from 'sonner';
import { turfService, ApiTurf } from '@/services/turfService';

interface FeaturedTurf {
  turfId: number;
  isPriority: number;
  fromDate: string;
  toDate: string;
}

const BASE_URL = 'https://spoortx.onrender.com/api';

const FeaturedTurfs = () => {
  const [allTurfs, setAllTurfs] = useState<ApiTurf[]>([]);
  const [featuredTurfs, setFeaturedTurfs] = useState<FeaturedTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurf, setSelectedTurf] = useState<ApiTurf | null>(null);
  const [newFeatured, setNewFeatured] = useState({
    isPriority: '1',
    fromDate: '',
    toDate: '',
  });

  // Fetch all turfs on component mount
  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      const turfs = await turfService.getTurfs();
      setAllTurfs(turfs);
      toast.success('Turfs loaded successfully');
    } catch (error) {
      console.error('Error fetching turfs:', error);
      toast.error('Failed to load turfs');
    } finally {
      setLoading(false);
    }
  };

  const getTurfDetails = (turfId: number) => {
    return allTurfs.find((t) => t.turfId === turfId);
  };

  // Filter turfs based on search query
  const filteredTurfs = allTurfs.filter((turf) => {
    const query = searchQuery.toLowerCase();
    return (
      turf.turfName.toLowerCase().includes(query) ||
      turf.city.toLowerCase().includes(query) ||
      turf.ownerName.toLowerCase().includes(query)
    );
  });

  // Available turfs (not already featured)
  const availableTurfs = filteredTurfs.filter(
    (turf) => !featuredTurfs.find((ft) => ft.turfId === turf.turfId)
  );

  const handleAddFeatured = async () => {
    if (!selectedTurf || !newFeatured.fromDate || !newFeatured.toDate || !newFeatured.isPriority) {
      toast.error('Please select a turf, priority level, and fill all date fields');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        turfId: selectedTurf.turfId,
        isPriority: parseInt(newFeatured.isPriority),
        fromDate: new Date(newFeatured.fromDate).toISOString(),
        toDate: new Date(newFeatured.toDate).toISOString(),
      };

      const response = await fetch(`${BASE_URL}/admin/turf-priorities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add to featured list
      setFeaturedTurfs([...featuredTurfs, payload]);
      addAuditLog('Add Featured Turf', `Added ${selectedTurf.turfName} as featured`);
      toast.success('Turf added to featured list');
      setDialogOpen(false);
      setSelectedTurf(null);
      setSearchQuery('');
      setNewFeatured({ isPriority: '1', fromDate: '', toDate: '' });
    } catch (error) {
      console.error('Error adding featured turf:', error);
      toast.error('Failed to add featured turf');
    }
  };

  const handleRemoveFeatured = async (turfId: number) => {
    try {
      const turf = getTurfDetails(turfId);
      // Here you would make a DELETE request to remove priority
      // For now, just remove from state
      setFeaturedTurfs(featuredTurfs.filter((ft) => ft.turfId !== turfId));
      addAuditLog('Remove Featured Turf', `Removed ${turf?.turfName} from featured list`);
      toast.success('Turf removed from featured list');
    } catch (error) {
      console.error('Error removing featured turf:', error);
      toast.error('Failed to remove featured turf');
    }
  };

  const handleSelectTurf = (turf: ApiTurf) => {
    setSelectedTurf(turf);
    setSearchQuery('');
  };

  const resetSelection = () => {
    setSelectedTurf(null);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading turfs...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Featured Turfs</h1>
            <p className="text-muted-foreground">Manage promotional and priority turfs</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-4 h-4" />
                Add Featured Turf
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Featured Turf</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Search and Select Turf */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search & Select Turf *</Label>
                  {!selectedTurf ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by turf name, city, or owner..."
                          className="pl-10"
                        />
                      </div>
                      {searchQuery && (
                        <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
                          {availableTurfs.length > 0 ? (
                            availableTurfs.map((turf) => (
                              <div
                                key={turf.turfId}
                                onClick={() => handleSelectTurf(turf)}
                                className="p-3 hover:bg-accent cursor-pointer transition-colors"
                              >
                                <div className="font-medium">{turf.turfName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {turf.city} • Owner: {turf.ownerName}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              No turfs found
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 border rounded-md bg-accent/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{selectedTurf.turfName}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedTurf.city} • Owner: {selectedTurf.ownerName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ₹{selectedTurf.pricePerHour}/hour
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetSelection}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority Level */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select
                    value={newFeatured.isPriority}
                    onValueChange={(value) => setNewFeatured({ ...newFeatured, isPriority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Priority 1 (Highest)</SelectItem>
                      <SelectItem value="2">Priority 2</SelectItem>
                      <SelectItem value="3">Priority 3</SelectItem>
                      <SelectItem value="4">Priority 4</SelectItem>
                      <SelectItem value="5">Priority 5</SelectItem>
                      <SelectItem value="6">Priority 6 (Lowest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromDate">From Date *</Label>
                    <Input
                      id="fromDate"
                      type="date"
                      value={newFeatured.fromDate}
                      onChange={(e) => setNewFeatured({ ...newFeatured, fromDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toDate">To Date *</Label>
                    <Input
                      id="toDate"
                      type="date"
                      value={newFeatured.toDate}
                      onChange={(e) => setNewFeatured({ ...newFeatured, toDate: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddFeatured}
                  className="w-full"
                  disabled={!selectedTurf}
                >
                  Add to Featured
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Featured Turfs List */}
        {featuredTurfs.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Featured Turfs</h3>
            <p className="text-muted-foreground mb-4">
              Add turfs to the featured list to promote them
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {featuredTurfs.map((featured, index) => {
              const turf = getTurfDetails(featured.turfId);
              if (!turf) return null;

              return (
                <Card
                  key={featured.turfId}
                  className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 border-primary/30"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                    {/* Photo Carousel */}
                    <div className="lg:col-span-4 relative">
                      {turf.images && turf.images.length > 0 ? (
                        <PhotoCarousel images={turf.images} alt={turf.turfName} />
                      ) : (
                        <div className="w-full h-48 bg-secondary rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground">No images</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-warning to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                        <Trophy className="w-3 h-3" />
                        Priority {featured.isPriority}
                      </div>
                    </div>

                    {/* Turf Details */}
                    <div className="lg:col-span-5 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-foreground">{turf.turfName}</h3>
                              <Badge className="bg-success/20 text-success border-success/40">
                                Priority {featured.isPriority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{turf.city}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{turf.description}</p>
                      </div>

                      {/* Sports Tags */}
                      <div className="flex flex-wrap gap-2">
                        {turf.sports.map((sport) => (
                          <Badge key={sport.sportId} variant="outline" className="bg-secondary/50">
                            {sport.sportName}
                          </Badge>
                        ))}
                      </div>

                      {/* Owner Info */}
                      <div className="p-4 bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-xl border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Owner</p>
                        <p className="font-semibold">{turf.ownerName}</p>
                      </div>
                    </div>

                    {/* Featured Details & Actions */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-5 h-5 text-primary" />
                          <p className="text-xs font-medium text-muted-foreground uppercase">Featured Details</p>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-2">
                          <div>
                            <span className="font-semibold text-foreground">Priority Level: </span>
                            <Badge variant="outline" className="ml-1">{featured.isPriority}</Badge>
                          </div>
                          <div className="pt-1 border-t">
                            <p>From: {new Date(featured.fromDate).toLocaleDateString()}</p>
                            <p>To: {new Date(featured.toDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-2">Pricing</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Price/Hour</span>
                            <span className="font-semibold text-sm text-success">
                              ₹{turf.pricePerHour}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Status</span>
                            <Badge variant={turf.isActive ? 'default' : 'secondary'} className="text-xs">
                              {turf.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-destructive hover:bg-destructive/10 gap-2"
                          onClick={() => handleRemoveFeatured(featured.turfId)}
                        >
                          <X className="w-4 h-4" />
                          Remove from Featured
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FeaturedTurfs;
