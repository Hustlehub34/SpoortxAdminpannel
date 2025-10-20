import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTurfs, addAuditLog } from '@/lib/mockData';
import { PartyPopper, Calendar, Users, DollarSign, MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  name: string;
  turfId: string;
  date: string;
  time: string;
  description: string;
  registrationCap: number;
  registrationFee: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 'evt_001',
      name: 'Summer Football Championship',
      turfId: 'turf_001',
      date: '2025-11-15',
      time: '18:00',
      description: 'Join us for an exciting 5v5 football tournament with amazing prizes!',
      registrationCap: 100,
      registrationFee: 500,
      registered: 45,
      status: 'upcoming',
    },
    {
      id: 'evt_002',
      name: 'Cricket Fest 2025',
      turfId: 'turf_002',
      date: '2025-11-20',
      time: '09:00',
      description: 'Annual cricket tournament for all age groups.',
      registrationCap: 80,
      registrationFee: 800,
      registered: 62,
      status: 'upcoming',
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    turfId: '',
    date: '',
    time: '',
    description: '',
    registrationCap: 50,
    registrationFee: 500,
  });

  const getTurfName = (turfId: string) => {
    return mockTurfs.find((t) => t.id === turfId)?.name || 'Unknown Turf';
  };

  const getTurfCity = (turfId: string) => {
    return mockTurfs.find((t) => t.id === turfId)?.city || '';
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'ongoing':
        return 'bg-success/10 text-success border-success/20';
      case 'completed':
        return 'bg-muted text-muted-foreground border-border';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.name || !newEvent.turfId || !newEvent.date || !newEvent.time) {
      toast.error('Please fill all required fields');
      return;
    }

    const event: Event = {
      id: `evt_${Date.now()}`,
      ...newEvent,
      registered: 0,
      status: 'upcoming',
    };

    setEvents([event, ...events]);
    addAuditLog('Add Event', `Created event: ${event.name} at ${getTurfName(event.turfId)}`);
    toast.success('Event added successfully');
    setDialogOpen(false);
    setNewEvent({
      name: '',
      turfId: '',
      date: '',
      time: '',
      description: '',
      registrationCap: 50,
      registrationFee: 500,
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    setEvents(events.filter((e) => e.id !== eventId));
    addAuditLog('Delete Event', `Deleted event: ${event?.name}`);
    toast.success('Event deleted successfully');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Events Management</h1>
            <p className="text-muted-foreground">Create and manage turf events & tournaments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name *</Label>
                  <Input
                    id="event-name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    placeholder="e.g. Summer Football Championship"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turf">Select Turf *</Label>
                  <Select value={newEvent.turfId} onValueChange={(value) => setNewEvent({ ...newEvent, turfId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose turf" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTurfs.map((turf) => (
                        <SelectItem key={turf.id} value={turf.id}>
                          {turf.name} - {turf.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cap">Registration Cap</Label>
                    <Input
                      id="cap"
                      type="number"
                      value={newEvent.registrationCap}
                      onChange={(e) => setNewEvent({ ...newEvent, registrationCap: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee">Registration Fee (₹)</Label>
                    <Input
                      id="fee"
                      type="number"
                      value={newEvent.registrationFee}
                      onChange={(e) => setNewEvent({ ...newEvent, registrationFee: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddEvent} className="w-full">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <PartyPopper className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{getTurfName(event.turfId)}, {getTurfCity(event.turfId)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}

                {/* Event Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Date & Time</p>
                    </div>
                    <p className="text-sm font-semibold">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>

                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-success" />
                      <p className="text-xs text-muted-foreground">Registration</p>
                    </div>
                    <p className="text-sm font-semibold">{event.registered} / {event.registrationCap}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((event.registered / event.registrationCap) * 100)}% filled
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg border border-warning/20">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-warning" />
                    <p className="text-xs text-muted-foreground">Registration Fee</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">₹{event.registrationFee}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-2 flex-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Events;
