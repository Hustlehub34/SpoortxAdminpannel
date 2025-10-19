import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Mail, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { addAuditLog } from '@/lib/mockData';

interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: Date;
  channel: 'whatsapp' | 'email' | 'sms';
}

const templates = [
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    variables: ['{user_name}', '{turf_name}', '{date}', '{time}', '{booking_id}', '{amount}'],
    template:
      'Hi {user_name}! Your booking at {turf_name} on {date} at {time} is confirmed. Booking ID: {booking_id}. Amount: ₹{amount}',
  },
  {
    id: 'payment_reminder',
    name: 'Payment Due Reminder',
    variables: ['{user_name}', '{due_amount}', '{due_date}', '{booking_link}'],
    template:
      'Hi {user_name}, you have a pending payment of ₹{due_amount} due on {due_date}. Pay now: {booking_link}',
  },
  {
    id: 'event_offer',
    name: 'Event/Offer Notification',
    variables: ['{user_name}', '{event_name}', '{signup_link}'],
    template:
      'Hi {user_name}! Exciting news! {event_name} is happening soon. Register now: {signup_link}',
  },
];

const Notifications = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState(selectedTemplate.template);
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [sendDialog, setSendDialog] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setMessage(template.template);
    }
  };

  const handleSendNotification = () => {
    if (!recipient || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    // Simulate sending
    const newLog: NotificationLog = {
      id: `NOT${Date.now()}`,
      type: selectedTemplate.name,
      recipient,
      message,
      status: Math.random() > 0.1 ? 'delivered' : 'failed',
      timestamp: new Date(),
      channel,
    };

    setLogs([newLog, ...logs]);
    addAuditLog('Send Notification', `Sent ${selectedTemplate.name} via ${channel} to ${recipient}`);

    if (newLog.status === 'delivered') {
      toast.success(`Notification sent via ${channel}!`);
    } else {
      toast.error('Failed to send notification');
    }

    setSendDialog(false);
    setRecipient('');
    setMessage(selectedTemplate.template);
  };

  const getStatusIcon = (status: NotificationLog['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'sent':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: NotificationLog['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-success/10 text-success border-success/20';
      case 'sent':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">Send notifications to users and track delivery</p>
          </div>
          <Dialog open={sendDialog} onOpenChange={setSendDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTemplate.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select value={channel} onValueChange={(value: any) => setChannel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          SMS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Input
                    placeholder={
                      channel === 'email' ? 'email@example.com' : '+91 98765 43210'
                    }
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                </div>

                <Button className="w-full gap-2" onClick={handleSendNotification}>
                  <Send className="w-4 h-4" />
                  Send Notification
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{template.template}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {template.variables.slice(0, 3).map((variable) => (
                  <Badge key={variable} variant="outline" className="text-xs">
                    {variable}
                  </Badge>
                ))}
                {template.variables.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.variables.length - 3}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  handleTemplateChange(template.id);
                  setSendDialog(true);
                }}
              >
                Use Template
              </Button>
            </Card>
          ))}
        </div>

        {/* Notification Logs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Notification History</h3>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications sent yet</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex-shrink-0 pt-1">{getStatusIcon(log.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{log.type}</p>
                      <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {log.channel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">To: {log.recipient}</p>
                    <p className="text-sm text-foreground line-clamp-2">{log.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {log.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Notifications;
