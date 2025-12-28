import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PhotoCarousel from '@/components/PhotoCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTurfs, mockTurfOwners, Turf, addAuditLog } from '@/lib/mockData';
import { Edit, CheckCircle, XCircle, Key, MapPin, TrendingUp, DollarSign, Calendar, Plus, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { turfService, Sport, Amenity, ApiTurf, TurfOwner } from '@/services/turfService';

const Turfs = () => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTurfs, setIsLoadingTurfs] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [turfOwners, setTurfOwners] = useState<TurfOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<TurfOwner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');

  const [newTurfData, setNewTurfData] = useState({
    turfName: '',
    city: 'Mumbai',
    pricePerHour:'',
    description: '',
    sportIds: [1, 2] as number[],
    amenityIds: [3, 5] as number[],
    isActive: true,
  });

  // Load turfs on component mount
  useEffect(() => {
    fetchTurfs();
  }, []);

  // Load initial data when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      loadInitialData();
    }
  }, [dialogOpen]);

  const fetchTurfs = async () => {
    try {
      setIsLoadingTurfs(true);
      const turfsData = await turfService.getTurfs();

      // Transform API data to match Turf interface
      const transformedTurfs: Turf[] = turfsData.map((apiTurf: ApiTurf) => ({
        id: `turf_${apiTurf.turfId}`,
        name: apiTurf.turfName,
        ownerId: `owner_${apiTurf.ownerId}`,
        ownerName: apiTurf.ownerName,
        city: apiTurf.city,
        address: apiTurf.description, // Using description as address for now
        sports: apiTurf.sports.map(s => s.sportName),
        images: apiTurf.images.length > 0 ? apiTurf.images : ['/placeholder.svg'],
        status: apiTurf.isActive ? 'active' : 'inactive',
        // Static fields
        totalBookings30d: Math.floor(Math.random() * 100) + 50,
        revenue30d: Math.floor(Math.random() * 50000) + 25000,
        pendingSettlements: Math.floor(Math.random() * 10000) + 5000,
        pricing: [{ sport: 'Default', pricePerHour: apiTurf.pricePerHour }],
        availableSlots: ['06:00-08:00', '08:00-10:00', '10:00-12:00', '18:00-20:00', '20:00-22:00'],
        cancellationPolicy: 'Free cancellation up to 24 hours before booking',
      }));

      setTurfs(transformedTurfs);
    } catch (error) {
      console.error('Error fetching turfs:', error);
      toast.error('Failed to load turfs. Please try again.');
      // Fall back to mock data if API fails
      setTurfs(mockTurfs);
    } finally {
      setIsLoadingTurfs(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [sportsData, amenitiesData, ownersData] = await Promise.all([
        turfService.getSports(),
        turfService.getAmenities(),
        turfService.getTurfOwners().catch(() => [])
      ]);

      setSports(sportsData);
      setAmenities(amenitiesData);
      setTurfOwners(ownersData);
      setFilteredOwners(ownersData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchOwners = () => {
    if (!ownerSearchQuery.trim()) {
      setFilteredOwners(turfOwners);
      return;
    }

    const query = ownerSearchQuery.toLowerCase();
    const filtered = turfOwners.filter(owner =>
      owner.name.toLowerCase().includes(query) ||
      owner.email.toLowerCase().includes(query) ||
      owner.city.toLowerCase().includes(query) ||
      owner.mobile.includes(query)
    );
    setFilteredOwners(filtered);
  };

  const updateTurfStatus = (turfId: string, status: Turf['status']) => {
    setTurfs(turfs.map((t) => (t.id === turfId ? { ...t, status } : t)));
    addAuditLog('Update Turf Status', `Changed turf ${turfId} status to ${status}`);
    toast.success(`Turf status updated to ${status}`);
  };

  const handleAddTurf = async () => {
    // Validate required fields
    if (!newTurfData.turfName || !newTurfData.city || !selectedOwnerId) {
      toast.error('Please fill all required fields and select a turf owner');
      return;
    }

    if (newTurfData.sportIds.length === 0) {
      toast.error('Please select at least one sport');
      return;
    }

    try {
      setIsLoading(true);

      // Call API to create turf
      const response = await turfService.createTurf(String(selectedOwnerId), {
        turfName: newTurfData.turfName,
        city: newTurfData.city,
        pricePerHour: newTurfData.pricePerHour,
        description: newTurfData.description,
        sportIds: newTurfData.sportIds,
        amenityIds: newTurfData.amenityIds,
        isActive: newTurfData.isActive,
      });

      toast.success('New turf added successfully');
      setDialogOpen(false);

      // Refresh turfs list to get the latest data
      await fetchTurfs();

      // Reset form
      setNewTurfData({
        turfName: 'Elite Sports Arena',
        city: 'Mumbai',
        pricePerHour: 1200,
        description: 'Synthetic 7-a-side floodlit turf',
        sportIds: [1, 2],
        amenityIds: [3, 5],
        isActive: true,
      });
      setSelectedOwnerId(null);
      setOwnerSearchQuery('');
      setFilteredOwners(turfOwners);
    } catch (error) {
      console.error('Error creating turf:', error);
      toast.error('Failed to create turf. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getOwnerName = (ownerId: string, turf?: Turf) => {
    // If turf has ownerName from API, use it
    if (turf && 'ownerName' in turf && turf.ownerName) {
      return turf.ownerName;
    }
    // Otherwise fallback to mock data
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background px-6 py-5 border-b">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    Add New Turf
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Fill in the details below to create a new turf listing
                  </p>
                </DialogHeader>
              </div>

              <ScrollArea className="max-h-[calc(90vh-180px)] px-6 py-1">
                <div className="space-y-6 py-6">
                  {/* Turf Owner Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <Label htmlFor="ownerId" className="text-base font-semibold">
                        Select Turf Owner <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    <div className="ml-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-150/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <Select
                        value={selectedOwnerId ? String(selectedOwnerId) : undefined}
                        onValueChange={(value) => setSelectedOwnerId(Number(value))}
                      >
                        <SelectTrigger className="bg-background/80 backdrop-blur-sm border-blue-300/50 dark:border-blue-700/50">
                          <SelectValue placeholder="Choose a turf owner from the list" />
                        </SelectTrigger>
                        <SelectContent className="max-w-md">
                          <div className="p-2 border-b sticky top-0 bg-background z-10">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                value={ownerSearchQuery}
                                onChange={(e) => {
                                  setOwnerSearchQuery(e.target.value);
                                  handleSearchOwners();
                                }}
                                placeholder="Search by name, email, city..."
                                className="pl-9 bg-muted/50"
                              />
                            </div>
                          </div>
                          <ScrollArea className="h-[220px]">
                            {filteredOwners.length > 0 ? (
                              filteredOwners.map((owner) => (
                                <SelectItem
                                  key={owner.userId}
                                  value={String(owner.userId)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col py-1">
                                    <span className="font-semibold text-sm">{owner.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {owner.email} • {owner.city}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-6 text-center">
                                <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground font-medium">
                                  {ownerSearchQuery ? 'No owners found matching your search' : 'No turf owners available'}
                                </p>
                              </div>
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <h3 className="text-base font-semibold">Basic Information</h3>
                    </div>

                    <div className="ml-3 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="turfName" className="text-sm font-medium flex items-center gap-1">
                            Turf Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="turfName"
                            value={newTurfData.turfName}
                            onChange={(e) => setNewTurfData({ ...newTurfData, turfName: e.target.value })}
                            placeholder="e.g., Elite Sports Arena"
                            className="bg-background/80 backdrop-blur-sm border-emerald-300/50 dark:border-emerald-700/50 focus:border-emerald-500 dark:focus:border-emerald-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium flex items-center gap-1">
                            City <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="city"
                            value={newTurfData.city}
                            onChange={(e) => setNewTurfData({ ...newTurfData, city: e.target.value })}
                            placeholder="e.g., Mumbai"
                            className="bg-background/80 backdrop-blur-sm border-emerald-300/50 dark:border-emerald-700/50 focus:border-emerald-500 dark:focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pricePerHour" className="text-sm font-medium flex items-center gap-1">
                          Price per Hour (₹) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pricePerHour"
                          type="number"
                          min="0"
                          step="100"
                          value={newTurfData.pricePerHour}
                          onChange={(e) => setNewTurfData({ ...newTurfData, pricePerHour: Number(e.target.value) })}
                          placeholder="e.g., 1200"
                          className="bg-background/80 backdrop-blur-sm border-emerald-300/50 dark:border-emerald-700/50 focus:border-emerald-500 dark:focus:border-emerald-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1">
                          Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={newTurfData.description}
                          onChange={(e) => setNewTurfData({ ...newTurfData, description: e.target.value })}
                          placeholder="Describe the turf facilities, surface type, and key features..."
                          className="resize-none min-h-[90px] bg-background/80 backdrop-blur-sm border-emerald-300/50 dark:border-emerald-700/50 focus:border-emerald-500 dark:focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sports Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <h3 className="text-base font-semibold">
                        Sports Available <span className="text-destructive">*</span>
                      </h3>
                    </div>
                    <div className="ml-3 p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                      {isLoading && sports.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading sports...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {sports.map((sport) => (
                            <div
                              key={sport.id}
                              className="flex items-center space-x-3 p-3 rounded-md bg-background/60 backdrop-blur-sm border border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer"
                            >
                              <Checkbox
                                id={`sport-${sport.id}`}
                                checked={newTurfData.sportIds.includes(sport.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewTurfData({ ...newTurfData, sportIds: [...newTurfData.sportIds, sport.id] });
                                  } else {
                                    setNewTurfData({ ...newTurfData, sportIds: newTurfData.sportIds.filter(id => id !== sport.id) });
                                  }
                                }}
                                className="border-orange-400 dark:border-orange-600"
                              />
                              <Label htmlFor={`sport-${sport.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                {sport.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amenities Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-muted-foreground/30 rounded-full" />
                      <h3 className="text-base font-semibold text-muted-foreground">Amenities (Optional)</h3>
                    </div>
                    <div className="ml-3 p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                      {isLoading && amenities.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading amenities...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {amenities.map((amenity) => (
                            <div
                              key={amenity.id}
                              className="flex items-center space-x-3 p-3 rounded-md bg-background/60 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                            >
                              <Checkbox
                                id={`amenity-${amenity.id}`}
                                checked={newTurfData.amenityIds.includes(amenity.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewTurfData({ ...newTurfData, amenityIds: [...newTurfData.amenityIds, amenity.id] });
                                  } else {
                                    setNewTurfData({ ...newTurfData, amenityIds: newTurfData.amenityIds.filter(id => id !== amenity.id) });
                                  }
                                }}
                                className="border-purple-400 dark:border-purple-600"
                              />
                              <Label htmlFor={`amenity-${amenity.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                {amenity.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <h3 className="text-base font-semibold">Turf Status</h3>
                    </div>
                    <div className="ml-3 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor="isActive" className="text-sm font-semibold cursor-pointer block">
                            Active Status
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            Enable this to make the turf visible and available for bookings immediately
                          </p>
                        </div>
                        <Switch
                          id="isActive"
                          checked={newTurfData.isActive}
                          onCheckedChange={(checked) => setNewTurfData({ ...newTurfData, isActive: checked })}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer with Actions */}
              <div className="border-t bg-muted/30 px-6 py-4 flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive font-medium">*</span> Required fields
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isLoading}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTurf}
                    disabled={isLoading}
                    className="min-w-[140px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Turf
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoadingTurfs && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Turfs Grid */}
        {!isLoadingTurfs && turfs.length > 0 && (
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
                    <p className="font-medium text-sm">{getOwnerName(turf.ownerId, turf)}</p>
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
        )}

        {/* Empty State */}
        {!isLoadingTurfs && turfs.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No turfs available</h3>
              <p className="text-sm text-muted-foreground">Click "Add New Turf" to create your first turf</p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Turfs;
