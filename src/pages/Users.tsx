import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { userService, User } from '@/services/userService';
import { Search, Shield, Calendar, Mail, Phone, MapPin, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'suspended':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'blocked':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage and monitor platform users</p>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Users Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">ID: {user.id}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      {user.userType && (
                        <Badge variant="outline">{user.userType}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-foreground truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="text-foreground">{user.phone}</span>
                  </div>
                  {user.city && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-foreground">{user.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {format(user.joinedAt, 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Wallet Balance</span>
                    </div>
                    <span className="font-bold text-foreground">
                      ₹{user.walletBalance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search criteria' : 'No users available'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;
