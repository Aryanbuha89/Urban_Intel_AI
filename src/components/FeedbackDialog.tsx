
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackDialogProps {
    directiveId?: string | number;
}

const FeedbackDialog = ({ directiveId }: FeedbackDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [opinion, setOpinion] = useState<'good' | 'bad' | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!opinion) {
            toast({
                title: "Selection Required",
                description: "Please select whether this is a Good or Bad decision.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('public_feedback')
                .insert({
                    directive_id: directiveId ? Number(directiveId) : null,
                    is_positive: opinion === 'good',
                    message: message.trim(),
                });

            if (error) throw error;

            toast({
                title: "Feedback Submitted",
                description: "Thank you for your input. Your feedback has been recorded for official review.",
            });

            setIsOpen(false);
            setOpinion(null);
            setMessage('');
        } catch (error) {
            console.error('Feedback error:', error);
            toast({
                title: "Submission Failed",
                description: "Could not submit feedback. Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                    <MessageSquare className="h-4 w-4" />
                    Give Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Public Feedback</DialogTitle>
                    <DialogDescription>
                        Your feedback helps officials understand public sentiment regarding this directive.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>What is your opinion on this decision?</Label>
                        <div className="flex gap-4">
                            <Button
                                variant={opinion === 'good' ? 'default' : 'outline'}
                                className={`flex-1 gap-2 ${opinion === 'good' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                onClick={() => setOpinion('good')}
                            >
                                <ThumbsUp className="h-4 w-4" />
                                Good Decision
                            </Button>
                            <Button
                                variant={opinion === 'bad' ? 'default' : 'outline'}
                                className={`flex-1 gap-2 ${opinion === 'bad' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                onClick={() => setOpinion('bad')}
                            >
                                <ThumbsDown className="h-4 w-4" />
                                Bad Decision
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="message">Comments (Optional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Share your thoughts or concerns..."
                            className="resize-none"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !opinion}>
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackDialog;
