import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTurfOwners, addAuditLog, TurfOwner } from '@/lib/mockData';
import { Plus, Edit, Trash2, Key, Mail, MessageSquare, FileText } from 'lucide-react';
import { toast } from 'sonner';

const TurfOwners = () => {
  const [owners, setOwners] = useState<TurfOwner[]>(mockTurfOwners);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({ userId: '', password: '' });
  const [newOwner, setNewOwner] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
  };

  const handleGenerateCredentials = (sendMethod?: 'email' | 'sms') => {
    const password = generatePassword();
    const userId = `OWN${String(owners.length + 1).padStart(3, '0')}`;

    setGeneratedCredentials({ userId, password });
    setShowCredentialsDialog(true);

    const action = sendMethod
      ? `Generated credentials for ${newOwner.name} and sent via ${sendMethod}`
      : `Generated credentials for ${newOwner.name}`;

    addAuditLog('Generate Credentials', action);

    if (sendMethod) {
      toast.success(`Credentials sent via ${sendMethod === 'email' ? 'Email' : 'SMS'}`);
    }
  };

  const handleAddOwner = () => {
    if (!newOwner.name || !newOwner.email || !newOwner.phone) {
      toast.error('Please fill all fields');
      return;
    }

    const owner: TurfOwner = {
      id: `OWN${String(owners.length + 1).padStart(3, '0')}`,
      ...newOwner,
      status: 'pending',
      createdAt: new Date(),
      totalBookings30d: 0,
      revenue30d: 0,
      pendingSettlements: 0,
    };

    setOwners([...owners, owner]);
    addAuditLog('Add Turf Owner', `Added new turf owner: ${owner.name}`);
    toast.success('Turf owner added successfully');
    setShowAddDialog(false);
    setNewOwner({ name: '', email: '', phone: '' });
  };

  const updateOwnerStatus = (ownerId: string, status: TurfOwner['status']) => {
    setOwners(owners.map((o) => (o.id === ownerId ? { ...o, status } : o)));
    addAuditLog('Update Status', `Changed status of owner ${ownerId} to ${status}`);
    toast.success(`Status updated to ${status}`);
  };

  const deleteOwner = (ownerId: string) => {
    setOwners(owners.filter((o) => o.id !== ownerId));
    addAuditLog('Delete Owner', `Deleted turf owner ${ownerId}`);
    toast.success('Turf owner deleted');
  };

  const getStatusColor = (status: TurfOwner['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'suspended':
        return 'bg-destructive/10 text-destructive border-destructive/20';
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Turf Owners</h1>
            <p className="text-muted-foreground">Manage turf owners and their credentials</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newOwner.email}
                    onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newOwner.phone}
                    onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddOwner} className="flex-1">
                    Add Owner
                  </Button>
                  <Button variant="outline" onClick={() => handleGenerateCredentials()} className="flex-1 gap-2">
                    <Key className="w-4 h-4" />
                    Generate Credentials
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateCredentials('email')}
                    className="flex-1 gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Generate & Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateCredentials('sms')}
                    className="flex-1 gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Generate & SMS
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Credentials Dialog */}
        <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generated Credentials</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="font-mono font-semibold text-lg">{generatedCredentials.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                  <p className="font-mono font-semibold text-lg">{generatedCredentials.password}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Share these credentials securely with the turf owner. They should change the password on first login.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Owners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {owners.map((owner) => (
            <Card key={owner.id} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{owner.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{owner.id}</p>
                  <Badge className={getStatusColor(owner.status)}>{owner.status}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteOwner(owner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{owner.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{owner.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Bookings</p>
                  <p className="font-bold text-foreground">{owner.totalBookings30d}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="font-bold text-foreground">₹{(owner.revenue30d / 1000).toFixed(1)}K</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Pending</p>
                  <p className="font-bold text-warning">₹{(owner.pendingSettlements / 1000).toFixed(1)}K</p>
                </div>
              </div>

              {owner.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateOwnerStatus(owner.id, 'active')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateOwnerStatus(owner.id, 'suspended')}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {owner.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => updateOwnerStatus(owner.id, 'suspended')}
                >
                  Suspend
                </Button>
              )}

              {owner.status === 'suspended' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => updateOwnerStatus(owner.id, 'active')}
                >
                  Reactivate
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TurfOwners;
