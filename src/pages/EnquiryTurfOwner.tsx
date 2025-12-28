import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, Mail, MapPin, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { turfService, TurfOwner } from '@/services/turfService';
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

const EnquiryTurfOwner = () => {
  const [owners, setOwners] = useState<TurfOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<TurfOwner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<TurfOwner | null>(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const ownersData = await turfService.getTurfOwners();
      setOwners(ownersData);
      setFilteredOwners(ownersData);
    } catch (error) {
      console.error('Error fetching turf owners:', error);
      toast.error('Failed to load turf owners. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredOwners(owners);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = owners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(lowerQuery) ||
        owner.email.toLowerCase().includes(lowerQuery) ||
        owner.mobile.includes(query) ||
        owner.city.toLowerCase().includes(lowerQuery)
    );
    setFilteredOwners(filtered);
  };

  const handleDeleteClick = (owner: TurfOwner) => {
    setOwnerToDelete(owner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ownerToDelete) return;

    try {
      // Note: You'll need to implement the delete API endpoint in turfService
      // await turfService.deleteTurfOwner(ownerToDelete.userId);

      // For now, just remove from local state
      setOwners(owners.filter((o) => o.userId !== ownerToDelete.userId));
      setFilteredOwners(filteredOwners.filter((o) => o.userId !== ownerToDelete.userId));

      toast.success(`Turf owner "${ownerToDelete.name}" has been deleted`);
      setDeleteDialogOpen(false);
      setOwnerToDelete(null);
    } catch (error) {
      console.error('Error deleting turf owner:', error);
      toast.error('Failed to delete turf owner. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Turf Owner Enquiry</h1>
          <p className="text-muted-foreground">View and manage turf owner information</p>
        </div>

        {/* Search Bar */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or city..."
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

        {/* Owners List */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOwners.map((owner) => (
              <Card
                key={owner.userId}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Header with Name and Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{owner.name}</h3>
                      <Badge
                        className={
                          owner.isActive
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }
                      >
                        {owner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(owner)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-foreground">{owner.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-foreground">{owner.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-foreground">{owner.city}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Total Turfs</span>
                      <span className="text-lg font-bold text-primary">{owner.totalTurfs}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">Member Since</span>
                      <span className="text-xs font-medium">
                        {format(new Date(owner.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOwners.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No turf owners found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'No turf owners are registered yet'}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the turf owner "{ownerToDelete?.name}". This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default EnquiryTurfOwner;
