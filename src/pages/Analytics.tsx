import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PhotoCarousel from '@/components/PhotoCarousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MapPin, TrendingUp, DollarSign, Calendar, Download, History, Send, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Static mock data for turfs with settlement info
interface WeeklySettlement {
  weekId: string;
  weekStart: string;
  weekEnd: string;
  totalRevenue: number;
  adminCommission: number; // 7%
  ownerAmount: number; // 93%
  urgentSettlements: { amount: number; date: string; note: string }[];
  settled: boolean;
  settledDate?: string;
  remainingAmount: number;
}

interface TurfSettlementData {
  turfId: number;
  turfName: string;
  ownerName: string;
  ownerId: number;
  city: string;
  images: string[];
  currentWeekRevenue: number;
  currentWeekAdminCommission: number;
  currentWeekOwnerAmount: number;
  currentWeekUrgentSettled: number;
  currentWeekRemaining: number;
  weeklyHistory: WeeklySettlement[];
}

// Static mock data
const staticTurfSettlements: TurfSettlementData[] = [
  {
    turfId: 1,
    turfName: 'Elite Sports Arena',
    ownerName: 'Rajesh Kumar',
    ownerId: 101,
    city: 'Mumbai',
    images: [
      'https://images.unsplash.com/photo-1459865264687-595d652de67e',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
    ],
    currentWeekRevenue: 15000,
    currentWeekAdminCommission: 1050, // 7%
    currentWeekOwnerAmount: 13950, // 93%
    currentWeekUrgentSettled: 2000,
    currentWeekRemaining: 11950,
    weeklyHistory: [
      {
        weekId: 'W1',
        weekStart: '2024-12-16',
        weekEnd: '2024-12-22',
        totalRevenue: 12000,
        adminCommission: 840,
        ownerAmount: 11160,
        urgentSettlements: [],
        settled: true,
        settledDate: '2024-12-23',
        remainingAmount: 0,
      },
      {
        weekId: 'W2',
        weekStart: '2024-12-09',
        weekEnd: '2024-12-15',
        totalRevenue: 18000,
        adminCommission: 1260,
        ownerAmount: 16740,
        urgentSettlements: [{ amount: 5000, date: '2024-12-12', note: 'Urgent payment requested' }],
        settled: true,
        settledDate: '2024-12-16',
        remainingAmount: 0,
      },
      {
        weekId: 'W3',
        weekStart: '2024-12-02',
        weekEnd: '2024-12-08',
        totalRevenue: 9500,
        adminCommission: 665,
        ownerAmount: 8835,
        urgentSettlements: [],
        settled: true,
        settledDate: '2024-12-09',
        remainingAmount: 0,
      },
    ],
  },
  {
    turfId: 2,
    turfName: 'Victory Sports Complex',
    ownerName: 'Priya Sharma',
    ownerId: 102,
    city: 'Bangalore',
    images: [
      'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68',
    ],
    currentWeekRevenue: 22000,
    currentWeekAdminCommission: 1540, // 7%
    currentWeekOwnerAmount: 20460, // 93%
    currentWeekUrgentSettled: 0,
    currentWeekRemaining: 20460,
    weeklyHistory: [
      {
        weekId: 'W1',
        weekStart: '2024-12-16',
        weekEnd: '2024-12-22',
        totalRevenue: 19000,
        adminCommission: 1330,
        ownerAmount: 17670,
        urgentSettlements: [{ amount: 3000, date: '2024-12-18', note: 'Emergency funds needed' }],
        settled: true,
        settledDate: '2024-12-23',
        remainingAmount: 0,
      },
      {
        weekId: 'W2',
        weekStart: '2024-12-09',
        weekEnd: '2024-12-15',
        totalRevenue: 15500,
        adminCommission: 1085,
        ownerAmount: 14415,
        urgentSettlements: [],
        settled: true,
        settledDate: '2024-12-16',
        remainingAmount: 0,
      },
    ],
  },
  {
    turfId: 3,
    turfName: 'Green Field Arena',
    ownerName: 'Amit Patel',
    ownerId: 103,
    city: 'Delhi',
    images: [
      'https://images.unsplash.com/photo-1551958219-acbc608c6377',
    ],
    currentWeekRevenue: 8500,
    currentWeekAdminCommission: 595, // 7%
    currentWeekOwnerAmount: 7905, // 93%
    currentWeekUrgentSettled: 1500,
    currentWeekRemaining: 6405,
    weeklyHistory: [
      {
        weekId: 'W1',
        weekStart: '2024-12-16',
        weekEnd: '2024-12-22',
        totalRevenue: 7000,
        adminCommission: 490,
        ownerAmount: 6510,
        urgentSettlements: [],
        settled: true,
        settledDate: '2024-12-23',
        remainingAmount: 0,
      },
    ],
  },
];

const Analytics = () => {
  const [turfData, setTurfData] = useState<TurfSettlementData[]>(staticTurfSettlements);
  const [urgentDialogOpen, setUrgentDialogOpen] = useState(false);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [selectedTurf, setSelectedTurf] = useState<TurfSettlementData | null>(null);
  const [urgentAmount, setUrgentAmount] = useState('');
  const [urgentNote, setUrgentNote] = useState('');

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.success(`Exporting weekly analytics as ${format.toUpperCase()}...`);
  };

  const handleUrgentSettlement = () => {
    if (!selectedTurf || !urgentAmount) {
      toast.error('Please enter an amount');
      return;
    }

    const amount = parseFloat(urgentAmount);
    if (amount <= 0 || amount > selectedTurf.currentWeekRemaining) {
      toast.error(`Amount must be between ₹1 and ₹${selectedTurf.currentWeekRemaining}`);
      return;
    }

    // Update the turf data
    setTurfData((prev) =>
      prev.map((turf) => {
        if (turf.turfId === selectedTurf.turfId) {
          return {
            ...turf,
            currentWeekUrgentSettled: turf.currentWeekUrgentSettled + amount,
            currentWeekRemaining: turf.currentWeekRemaining - amount,
          };
        }
        return turf;
      })
    );

    toast.success(`₹${amount} marked as urgent settlement for ${selectedTurf.turfName}`);
    setUrgentDialogOpen(false);
    setUrgentAmount('');
    setUrgentNote('');
    setSelectedTurf(null);
  };

  const handleWeeklySettlement = () => {
    if (!selectedTurf) return;

    // Move current week to history and reset
    setTurfData((prev) =>
      prev.map((turf) => {
        if (turf.turfId === selectedTurf.turfId) {
          const newHistoryEntry: WeeklySettlement = {
            weekId: `W${turf.weeklyHistory.length + 1}`,
            weekStart: getWeekStart(),
            weekEnd: getWeekEnd(),
            totalRevenue: turf.currentWeekRevenue,
            adminCommission: turf.currentWeekAdminCommission,
            ownerAmount: turf.currentWeekOwnerAmount,
            urgentSettlements: turf.currentWeekUrgentSettled > 0
              ? [{ amount: turf.currentWeekUrgentSettled, date: new Date().toISOString().split('T')[0], note: 'Urgent settlement' }]
              : [],
            settled: true,
            settledDate: new Date().toISOString().split('T')[0],
            remainingAmount: 0,
          };

          return {
            ...turf,
            currentWeekRevenue: 0,
            currentWeekAdminCommission: 0,
            currentWeekOwnerAmount: 0,
            currentWeekUrgentSettled: 0,
            currentWeekRemaining: 0,
            weeklyHistory: [newHistoryEntry, ...turf.weeklyHistory],
          };
        }
        return turf;
      })
    );

    toast.success(`Weekly settlement completed for ${selectedTurf.turfName}. Week reset to ₹0`);
    setSettleDialogOpen(false);
    setSelectedTurf(null);
  };

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const getWeekEnd = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? 0 : 7);
    const sunday = new Date(now.setDate(diff));
    return sunday.toISOString().split('T')[0];
  };

  const openUrgentDialog = (turf: TurfSettlementData) => {
    setSelectedTurf(turf);
    setUrgentDialogOpen(true);
  };

  const openSettleDialog = (turf: TurfSettlementData) => {
    setSelectedTurf(turf);
    setSettleDialogOpen(true);
  };

  // Calculate totals
  const totalRevenue = turfData.reduce((sum, t) => sum + t.currentWeekRevenue, 0);
  const totalAdminCommission = turfData.reduce((sum, t) => sum + t.currentWeekAdminCommission, 0);
  const totalOwnerAmount = turfData.reduce((sum, t) => sum + t.currentWeekOwnerAmount, 0);
  const totalPending = turfData.reduce((sum, t) => sum + t.currentWeekRemaining, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Weekly Settlements</h1>
            <p className="text-muted-foreground">
              Track weekly revenue & settlements (Monday to Sunday) • Admin Commission: 7%
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-muted-foreground uppercase">Total Revenue (This Week)</span>
            </div>
            <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-muted-foreground uppercase">Admin Commission (7%)</span>
            </div>
            <p className="text-2xl font-bold">₹{totalAdminCommission.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-xs text-muted-foreground uppercase">Owner Amount (93%)</span>
            </div>
            <p className="text-2xl font-bold">₹{totalOwnerAmount.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-warning" />
              <span className="text-xs text-muted-foreground uppercase">Pending Settlement</span>
            </div>
            <p className="text-2xl font-bold">₹{totalPending.toLocaleString()}</p>
          </Card>
        </div>

        {/* Turfs Settlement Cards */}
        <div className="space-y-6">
          {turfData.map((turf) => (
            <Card
              key={turf.turfId}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Photo Carousel - Left */}
                  <div className="lg:col-span-3">
                    <PhotoCarousel images={turf.images} alt={turf.turfName} />
                  </div>

                  {/* Turf Details - Middle */}
                  <div className="lg:col-span-3 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{turf.turfName}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{turf.city}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Owner</p>
                      <p className="font-semibold">{turf.ownerName}</p>
                      <p className="text-xs text-muted-foreground">ID: {turf.ownerId}</p>
                    </div>
                  </div>

                  {/* Current Week Metrics */}
                  <div className="lg:col-span-3 space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Current Week
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-secondary/30 rounded">
                        <span className="text-sm">Total Revenue</span>
                        <span className="font-semibold">₹{turf.currentWeekRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-purple-500/10 rounded">
                        <span className="text-sm">Admin (7%)</span>
                        <span className="font-semibold text-purple-600">-₹{turf.currentWeekAdminCommission.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-success/10 rounded">
                        <span className="text-sm">Owner (93%)</span>
                        <span className="font-semibold text-success">₹{turf.currentWeekOwnerAmount.toLocaleString()}</span>
                      </div>
                      {turf.currentWeekUrgentSettled > 0 && (
                        <div className="flex justify-between p-2 bg-warning/10 rounded">
                          <span className="text-sm">Urgent Settled</span>
                          <span className="font-semibold text-warning">-₹{turf.currentWeekUrgentSettled.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <span className="font-medium">Remaining</span>
                        <span className="font-bold text-primary text-lg">₹{turf.currentWeekRemaining.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-3 space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase">Actions</h4>

                    {/* Urgent Settlement Button */}
                    <Dialog open={urgentDialogOpen && selectedTurf?.turfId === turf.turfId} onOpenChange={setUrgentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full gap-2 border-warning text-warning hover:bg-warning/10"
                          onClick={() => openUrgentDialog(turf)}
                          disabled={turf.currentWeekRemaining <= 0}
                        >
                          <Send className="w-4 h-4" />
                          Urgent Settlement
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Urgent Settlement - {turf.turfName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="p-4 bg-secondary/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Available for urgent settlement:</p>
                            <p className="text-2xl font-bold text-primary">₹{turf.currentWeekRemaining.toLocaleString()}</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Amount to Transfer *</Label>
                            <Input
                              type="number"
                              value={urgentAmount}
                              onChange={(e) => setUrgentAmount(e.target.value)}
                              placeholder="Enter amount"
                              max={turf.currentWeekRemaining}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Note (Optional)</Label>
                            <Input
                              value={urgentNote}
                              onChange={(e) => setUrgentNote(e.target.value)}
                              placeholder="Reason for urgent settlement"
                            />
                          </div>
                          <Button onClick={handleUrgentSettlement} className="w-full">
                            Confirm Urgent Transfer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Weekly Settlement Button */}
                    <Dialog open={settleDialogOpen && selectedTurf?.turfId === turf.turfId} onOpenChange={setSettleDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full gap-2"
                          onClick={() => openSettleDialog(turf)}
                          disabled={turf.currentWeekRemaining <= 0}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete Weekly Settlement
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Complete Settlement - {turf.turfName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                            <p className="text-sm text-muted-foreground">Amount to settle:</p>
                            <p className="text-3xl font-bold text-success">₹{turf.currentWeekRemaining.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              This will mark the week as settled and reset to ₹0
                            </p>
                          </div>
                          <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Total Revenue:</span>
                              <span>₹{turf.currentWeekRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Admin Commission (7%):</span>
                              <span>-₹{turf.currentWeekAdminCommission.toLocaleString()}</span>
                            </div>
                            {turf.currentWeekUrgentSettled > 0 && (
                              <div className="flex justify-between text-sm">
                                <span>Already Paid (Urgent):</span>
                                <span>-₹{turf.currentWeekUrgentSettled.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>Final Amount:</span>
                              <span className="text-success">₹{turf.currentWeekRemaining.toLocaleString()}</span>
                            </div>
                          </div>
                          <Button onClick={handleWeeklySettlement} className="w-full bg-success hover:bg-success/90">
                            Confirm Settlement & Reset Week
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Settlement History Accordion */}
                <Accordion type="single" collapsible className="mt-6">
                  <AccordionItem value="history" className="border-none">
                    <AccordionTrigger className="hover:no-underline p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        <span>Weekly Settlement History ({turf.weeklyHistory.length} weeks)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {turf.weeklyHistory.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Week</TableHead>
                              <TableHead>Period</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">Admin (7%)</TableHead>
                              <TableHead className="text-right">Owner (93%)</TableHead>
                              <TableHead className="text-right">Urgent Paid</TableHead>
                              <TableHead>Settled On</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {turf.weeklyHistory.map((week) => (
                              <TableRow key={week.weekId}>
                                <TableCell className="font-medium">{week.weekId}</TableCell>
                                <TableCell className="text-sm">
                                  {new Date(week.weekStart).toLocaleDateString()} - {new Date(week.weekEnd).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">₹{week.totalRevenue.toLocaleString()}</TableCell>
                                <TableCell className="text-right text-purple-600">₹{week.adminCommission.toLocaleString()}</TableCell>
                                <TableCell className="text-right text-success">₹{week.ownerAmount.toLocaleString()}</TableCell>
                                <TableCell className="text-right text-warning">
                                  {week.urgentSettlements.length > 0
                                    ? `₹${week.urgentSettlements.reduce((s, u) => s + u.amount, 0).toLocaleString()}`
                                    : '-'}
                                </TableCell>
                                <TableCell>{week.settledDate ? new Date(week.settledDate).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>
                                  <Badge className={week.settled ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}>
                                    {week.settled ? 'Settled' : 'Pending'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No settlement history yet</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
