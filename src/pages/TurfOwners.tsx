import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addAuditLog } from '@/lib/mockData';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface TurfOwner {
  userId: number;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  totalTurfs: number;
  ownedTurfs: any[];
}

interface State {
  stateId: number;
  stateName: string;
}

interface City {
  cityId: number;
  stateId: number;
  cityName: string;
}

const baseUrl = 'https://spoortx.onrender.com/api';

const TurfOwners = () => {
  const [owners, setOwners] = useState<TurfOwner[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingOwners, setIsFetchingOwners] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('');
  const [newOwner, setNewOwner] = useState({
    name: '',
    email: '',
    mobile: '',
    city: '',
 
  });

  // Fetch all turf owners
  useEffect(() => {
    fetchTurfOwners();
  }, []);

  // Fetch states when dialog opens
  useEffect(() => {
    if (showAddDialog) {
      fetchStates();
    }
  }, [showAddDialog]);

  // Fetch cities when state is selected
  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const fetchTurfOwners = async () => {
    setIsFetchingOwners(true);
    try {
      const response = await fetch(`${baseUrl}/Admin/turf-owners`);
      if (!response.ok) throw new Error('Failed to fetch turf owners');

      const data = await response.json();
      if (data.status && data.data) {
        setOwners(data.data.turfOwners || []);
      }
    } catch (error) {
      console.error('Error fetching turf owners:', error);
      toast.error('Failed to fetch turf owners');
    } finally {
      setIsFetchingOwners(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch(`${baseUrl}/Location/states`);
      if (!response.ok) throw new Error('Failed to fetch states');

      const data = await response.json();
      if (data.data) {
        setStates(data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Failed to fetch states');
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const response = await fetch(`${baseUrl}/Location/states/${stateId}/cities`);
      if (!response.ok) throw new Error('Failed to fetch cities');

      const data = await response.json();
      if (data.data) {
        setCities(data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to fetch cities');
    }
  };

  const handleAddOwner = async () => {
    // Validate all required fields
    if (!newOwner.name || !newOwner.email || !newOwner.mobile || !newOwner.city ) {
      toast.error('Please fill all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the API payload
      const payload = {
        name: newOwner.name,
        email: newOwner.email,
        mobile: newOwner.mobile,
        city: newOwner.city,

      };

      // Make API call to register turf owner
      const response = await fetch(`${baseUrl}/TurfOwner/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to add turf owner');
      }

      await response.json();

      // Refresh the list
      await fetchTurfOwners();

      addAuditLog('Add Turf Owner', `Added new turf owner: ${newOwner.name}`);
      toast.success('Turf owner added successfully');
      setShowAddDialog(false);
      setNewOwner({ name: '', email: '', mobile: '', city: '' });
      setSelectedState('');
    } catch (error) {
      toast.error('Failed to add turf owner. Please try again.');
      console.error('Error adding turf owner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOwnerStatus = async (ownerId: number, currentStatus: boolean) => {
    try {
      // Update local state optimistically
      setOwners(owners.map((o) =>
        o.userId === ownerId ? { ...o, isActive: !currentStatus } : o
      ));

      addAuditLog('Toggle Status', `Changed status of owner ${ownerId} to ${!currentStatus ? 'active' : 'inactive'}`);
      toast.success(`Owner ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      // Revert on error
      setOwners(owners.map((o) =>
        o.userId === ownerId ? { ...o, isActive: currentStatus } : o
      ));
      toast.error('Failed to update status');
    }
  };

  const deleteOwner = async (ownerId: number) => {
    try {
      setOwners(owners.filter((o) => o.userId !== ownerId));
      addAuditLog('Delete Owner', `Deleted turf owner ${ownerId}`);
      toast.success('Turf owner deleted');
    } catch (error) {
      toast.error('Failed to delete owner');
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-success/10 text-success border-success/20'
      : 'bg-muted/10 text-muted-foreground border-muted/20';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Turf Owners</h1>
            <p className="text-muted-foreground">Manage turf owners and their credentials</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              // Reset form when dialog closes
              setNewOwner({ name: '', email: '', mobile: '', city: '' });
              setSelectedState('');
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Owner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Turf Owner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newOwner.name}
                    onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                    placeholder="Raj Kumar"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newOwner.email}
                    onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                    placeholder="athawalesugat17@gmail.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={newOwner.mobile}
                    onChange={(e) => setNewOwner({ ...newOwner, mobile: e.target.value })}
                    placeholder="9123456789"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.stateId} value={state.stateId.toString()}>
                            {state.stateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select
                      value={newOwner.city}
                      onValueChange={(value) => setNewOwner({ ...newOwner, city: value })}
                      disabled={!selectedState}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedState ? "Select City" : "Select State First"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.cityId} value={city.cityName}>
                            {city.cityName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
        
                <Button
                  onClick={handleAddOwner}
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Owner'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Owners Grid */}
        {isFetchingOwners ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : owners.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No turf owners found</p>
            <p className="text-sm text-muted-foreground mt-2">Click "Add Owner" to add your first turf owner</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {owners.map((owner) => (
              <Card key={owner.userId} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{owner.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">ID: {owner.userId}</p>
                    <Badge className={getStatusColor(owner.isActive)}>
                      {owner.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteOwner(owner.userId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium truncate ml-2">{owner.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-medium">{owner.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span className="font-medium">{owner.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Turfs:</span>
                    <span className="font-medium">{owner.totalTurfs}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleOwnerStatus(owner.userId, owner.isActive)}
                  >
                    {owner.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TurfOwners;
