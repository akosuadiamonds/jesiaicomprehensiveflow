import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmailPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientEmail: string;
  schoolName: string;
  planName: string;
  amount: number;
  currency: string;
  teacherSlots: number;
  studentSlots: number;
  onSend: () => void;
  sending?: boolean;
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  open, onOpenChange, recipientEmail, schoolName, planName,
  amount, currency, teacherSlots, studentSlots, onSend, sending
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState(`Subscription Payment – ${schoolName}`);
  const [customMessage, setCustomMessage] = useState('');

  const emailBody = `
Dear ${schoolName} Administrator,

We are pleased to inform you that a subscription has been created for your institution on the Jesi AI platform.

Subscription Details:
• Plan: ${planName}
• Teacher Slots: ${teacherSlots}
• Student Slots: ${studentSlots}
• Total Amount: ${currency} ${amount.toFixed(2)}

${customMessage ? `Note from Admin:\n${customMessage}\n` : ''}To activate your subscription, please proceed with the payment using the link below:

[Payment Link will be generated]

Once payment is confirmed, your institution will have full access to the platform.

If you have any questions, please don't hesitate to reach out to our support team.

Best regards,
Jesi AI Platform Team
  `.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" /> Email Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Email Header */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Label className="w-16 text-muted-foreground text-xs">To:</Label>
              <Badge variant="secondary" className="font-mono text-xs">{recipientEmail}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-16 text-muted-foreground text-xs">Subject:</Label>
              {isEditing ? (
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-8 text-sm" />
              ) : (
                <span className="text-sm font-medium">{subject}</span>
              )}
            </div>
          </div>

          {/* Email Body */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email Body</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-1 text-xs">
                <Pencil className="w-3 h-3" /> {isEditing ? 'Preview' : 'Edit'}
              </Button>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">The main body is auto-generated. Add a custom note below:</p>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a custom message to include in the email..."
                  className="min-h-[80px]"
                />
              </div>
            ) : (
              <div className="bg-background rounded-lg p-4 border border-border">
                <pre className="whitespace-pre-wrap text-sm font-sans text-foreground leading-relaxed">
                  {emailBody}
                </pre>
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h4 className="text-sm font-semibold text-primary mb-2">Subscription Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">School:</div>
              <div className="font-medium">{schoolName}</div>
              <div className="text-muted-foreground">Plan:</div>
              <div className="font-medium">{planName}</div>
              <div className="text-muted-foreground">Amount:</div>
              <div className="font-medium">{currency} {amount.toFixed(2)}</div>
              <div className="text-muted-foreground">Teacher / Student Slots:</div>
              <div className="font-medium">{teacherSlots} / {studentSlots}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="hero" onClick={onSend} disabled={sending} className="gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPreviewModal;
