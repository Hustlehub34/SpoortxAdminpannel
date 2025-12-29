import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PhotoCarousel from '@/components/PhotoCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { addAuditLog } from '@/lib/mockData';
import { Star, MapPin, Plus, X, Trophy, Search, Edit, Power } from 'lucide-react';
import { toast } from 'sonner';
import { turfService, ApiTurf } from '@/services/turfService';

interface FeaturedTurf {
  id?: number;
  turfId: number;
  turfName?: string;
  priority: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const BASE_URL = 'https://spoortx.onrender.com/api';

const FeaturedTurfs = () => {
  const [allTurfs, setAllTurfs] = useState<ApiTurf[]>([]);
  const [featuredTurfs, setFeaturedTurfs] = useState<FeaturedTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurf, setSelectedTurf] = useState<ApiTurf | null>(null);
  const [editingFeatured, setEditingFeatured] = useState<FeaturedTurf | null>(null);
  const [newFeatured, setNewFeatured] = useState({
    priority: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [editForm, setEditForm] = useState({
    priority: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Fetch all turfs and featured turfs on component mount
  useEffect(() => {
    fetchTurfs();
    fetchFeaturedTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      const turfs = await turfService.getTurfs();
      setAllTurfs(turfs);
    } catch (error) {
      console.error('Error fetching turfs:', error);
      toast.error('Failed to load turfs');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedTurfs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/featured-turfs`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setFeaturedTurfs(result.data);
      }
    } catch (error) {
      console.error('Error fetching featured turfs:', error);
      toast.error('Failed to load featured turfs');
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const handleAddFeatured = async () => {
    if (!selectedTurf || !newFeatured.startDate || !newFeatured.endDate || !newFeatured.priority) {
      toast.error('Please select a turf, priority, and fill all date fields');
      return;
    }

    const priorityNum = parseInt(newFeatured.priority);
    if (isNaN(priorityNum) || priorityNum < 1) {
      toast.error('Priority must be at least 1');
      return;
    }

    try {
      const payload = {
        turfId: selectedTurf.turfId,
        priority: priorityNum,
        startDate: new Date(newFeatured.startDate).toISOString(),
        endDate: new Date(newFeatured.endDate).toISOString(),
        isActive: newFeatured.isActive,
      };

      const response = await fetch(`${BASE_URL}/admin/featured-turfs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add to featured list with ID from response if available
      const newFeaturedTurf: FeaturedTurf = {
        ...payload,
        id: data?.data?.id || featuredTurfs.length + 1,
      };
      setFeaturedTurfs([...featuredTurfs, newFeaturedTurf]);
      addAuditLog('Add Featured Turf', `Added ${selectedTurf.turfName} as featured with priority ${payload.priority}`);
      toast.success('Turf added to featured list');
      setDialogOpen(false);
      setSelectedTurf(null);
      setSearchQuery('');
      setNewFeatured({ priority: '', startDate: '', endDate: '', isActive: true });
    } catch (error) {
      console.error('Error adding featured turf:', error);
      toast.error('Failed to add featured turf');
    }
  };

  const handleUpdateFeatured = async () => {
    if (!editingFeatured || !editForm.startDate || !editForm.endDate || !editForm.priority) {
      toast.error('Please fill all required fields');
      return;
    }

    const priorityNum = parseInt(editForm.priority);
    if (isNaN(priorityNum) || priorityNum < 1) {
      toast.error('Priority must be at least 1');
      return;
    }

    try {
      const payload = {
        turfId: editingFeatured.turfId,
        priority: priorityNum,
        startDate: new Date(editForm.startDate).toISOString(),
        endDate: new Date(editForm.endDate).toISOString(),
        isActive: editForm.isActive,
      };

      const response = await fetch(`${BASE_URL}/admin/featured-turfs/${editingFeatured.id || editingFeatured.turfId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update in local state
      setFeaturedTurfs((prev) =>
        prev.map((ft) =>
          ft.turfId === editingFeatured.turfId
            ? { ...ft, ...payload }
            : ft
        )
      );

      const turf = getTurfDetails(editingFeatured.turfId);
      addAuditLog('Update Featured Turf', `Updated ${turf?.turfName} - Priority: ${payload.priority}, Active: ${payload.isActive}`);
      toast.success('Featured turf updated successfully');
      setEditDialogOpen(false);
      setEditingFeatured(null);
    } catch (error) {
      console.error('Error updating featured turf:', error);
      toast.error('Failed to update featured turf');
    }
  };

  const handleToggleActive = async (featured: FeaturedTurf) => {
    try {
      const payload = {
        turfId: featured.turfId,
        priority: featured.priority,
        startDate: featured.startDate,
        endDate: featured.endDate,
        isActive: !featured.isActive,
      };

      const response = await fetch(`${BASE_URL}/admin/featured-turfs/${featured.id || featured.turfId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update in local state
      setFeaturedTurfs((prev) =>
        prev.map((ft) =>
          ft.turfId === featured.turfId
            ? { ...ft, isActive: !ft.isActive }
            : ft
        )
      );

      const turf = getTurfDetails(featured.turfId);
      toast.success(`${turf?.turfName} ${!featured.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleRemoveFeatured = async (turfId: number) => {
    try {
      const turf = getTurfDetails(turfId);

      // Uncomment below to make DELETE request if you have that endpoint
      // const featured = featuredTurfs.find((ft) => ft.turfId === turfId);
      // await fetch(`${BASE_URL}/admin/featured-turfs/${featured?.id || turfId}`, {
      //   method: 'DELETE',
      //   headers: getAuthHeaders(),
      // });

      setFeaturedTurfs(featuredTurfs.filter((ft) => ft.turfId !== turfId));
      addAuditLog('Remove Featured Turf', `Removed ${turf?.turfName} from featured list`);
      toast.success('Turf removed from featured list');
    } catch (error) {
      console.error('Error removing featured turf:', error);
      toast.error('Failed to remove featured turf');
    }
  };

  const handleEditClick = (featured: FeaturedTurf) => {
    setEditingFeatured(featured);
    setEditForm({
      priority: featured.priority.toString(),
      startDate: featured.startDate.split('T')[0],
      endDate: featured.endDate.split('T')[0],
      isActive: featured.isActive,
    });
    setEditDialogOpen(true);
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

                {/* Priority - Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Input
                    id="priority"
                    type="number"
                    min={1}
                    value={newFeatured.priority}
                    onChange={(e) => setNewFeatured({ ...newFeatured, priority: e.target.value })}
                    placeholder="Enter priority (e.g., 1, 2, 3...)"
                  />
                  <p className="text-xs text-muted-foreground">Lower number = Higher priority</p>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newFeatured.startDate}
                      onChange={(e) => setNewFeatured({ ...newFeatured, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newFeatured.endDate}
                      onChange={(e) => setNewFeatured({ ...newFeatured, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-xs text-muted-foreground">Enable to show this turf as featured</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={newFeatured.isActive}
                    onCheckedChange={(checked) => setNewFeatured({ ...newFeatured, isActive: checked })}
                  />
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
            {featuredTurfs.map((featured) => {
              const turf = getTurfDetails(featured.turfId);
              const turfName = turf?.turfName || featured.turfName || `Turf #${featured.turfId}`;

              return (
                <Card
                  key={featured.turfId}
                  className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 ${
                    featured.isActive ? 'border-primary/30' : 'border-muted opacity-60'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                    {/* Photo Carousel */}
                    <div className="lg:col-span-4 relative">
                      {turf?.images && turf.images.length > 0 ? (
                        <PhotoCarousel images={turf.images} alt={turfName} />
                      ) : (
                        <div className="w-full h-48 bg-secondary rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground">No images</span>
                        </div>
                      )}
                      <div className={`absolute top-4 right-4 ${featured.isActive ? 'bg-gradient-to-r from-warning to-yellow-500' : 'bg-muted'} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 ${featured.isActive ? 'animate-pulse' : ''}`}>
                        <Trophy className="w-3 h-3" />
                        Priority {featured.priority}
                      </div>
                      {!featured.isActive && (
                        <div className="absolute top-4 left-4 bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                          Inactive
                        </div>
                      )}
                    </div>

                    {/* Turf Details */}
                    <div className="lg:col-span-5 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-foreground">{turfName}</h3>
                              <Badge className={featured.isActive ? 'bg-success/20 text-success border-success/40' : 'bg-muted text-muted-foreground'}>
                                Priority {featured.priority}
                              </Badge>
                              <Badge variant={featured.isActive ? 'default' : 'secondary'}>
                                {featured.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            {turf?.city && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{turf.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {turf?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{turf.description}</p>
                        )}
                      </div>

                      {/* Sports Tags */}
                      {turf?.sports && turf.sports.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {turf.sports.map((sport) => (
                            <Badge key={sport.sportId} variant="outline" className="bg-secondary/50">
                              {sport.sportName}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Owner Info */}
                      {turf?.ownerName && (
                        <div className="p-4 bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-xl border border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Owner</p>
                          <p className="font-semibold">{turf.ownerName}</p>
                        </div>
                      )}
                    </div>

                    {/* Featured Details & Actions */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-5 h-5 text-primary" />
                          <p className="text-xs font-medium text-muted-foreground uppercase">Featured Details</p>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">Priority:</span>
                            <Badge variant="outline">{featured.priority}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">Status:</span>
                            <Badge variant={featured.isActive ? 'default' : 'secondary'}>
                              {featured.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="pt-2 border-t space-y-1">
                            <p>Start: {new Date(featured.startDate).toLocaleDateString()}</p>
                            <p>End: {new Date(featured.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      {turf?.pricePerHour && (
                        <div className="p-4 bg-secondary/50 rounded-xl">
                          <p className="text-xs text-muted-foreground mb-2">Pricing</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs">Price/Hour</span>
                              <span className="font-semibold text-sm text-success">
                                ₹{turf.pricePerHour}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => handleEditClick(featured)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit Featured
                        </Button>

                        {/* Toggle Active Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-full gap-2 ${featured.isActive ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}
                          onClick={() => handleToggleActive(featured)}
                        >
                          <Power className="w-4 h-4" />
                          {featured.isActive ? 'Deactivate' : 'Activate'}
                        </Button>

                        {/* Remove Button */}
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
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Featured Turf</DialogTitle>
          </DialogHeader>
          {editingFeatured && (
            <div className="space-y-4 py-4">
              {/* Turf Info */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="font-semibold">
                  {getTurfDetails(editingFeatured.turfId)?.turfName || editingFeatured.turfName || `Turf #${editingFeatured.turfId}`}
                </p>
                {getTurfDetails(editingFeatured.turfId)?.city && (
                  <p className="text-sm text-muted-foreground">
                    {getTurfDetails(editingFeatured.turfId)?.city}
                  </p>
                )}
              </div>

              {/* Priority - Number Input */}
              <div className="space-y-2">
                <Label>Priority *</Label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  placeholder="Enter priority (e.g., 1, 2, 3...)"
                />
                <p className="text-xs text-muted-foreground">Lower number = Higher priority</p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Active Status</Label>
                  <p className="text-xs text-muted-foreground">Enable to show this turf as featured</p>
                </div>
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                />
              </div>

              <Button onClick={handleUpdateFeatured} className="w-full">
                Update Featured Turf
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default FeaturedTurfs;
