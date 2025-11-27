import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Calendar, Activity, Heart } from 'lucide-react';

interface ActionApprovalCardProps {
  action: {
    type: string;
    description: string;
    details: Record<string, any>;
  };
  onApprove: () => void;
  onReject: () => void;
}

const getActionIcon = (type: string) => {
  switch (type) {
    case 'add_cycle_event':
      return Calendar;
    case 'log_training':
      return Activity;
    case 'log_symptoms':
      return Heart;
    default:
      return CheckCircle2;
  }
};

const getActionTitle = (type: string) => {
  switch (type) {
    case 'add_cycle_event':
      return 'Add Cycle Event';
    case 'log_training':
      return 'Log Training Session';
    case 'log_symptoms':
      return 'Log Symptoms';
    default:
      return 'Confirm Action';
  }
};

export function ActionApprovalCard({ action, onApprove, onReject }: ActionApprovalCardProps) {
  const Icon = getActionIcon(action.type);
  
  return (
    <Card className="border-2 border-primary/50 bg-primary/5 animate-in fade-in slide-in-from-bottom-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{getActionTitle(action.type)}</CardTitle>
            <CardDescription className="text-xs">Review and approve this action</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{action.description}</p>
        
        {Object.keys(action.details).length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            {Object.entries(action.details).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onApprove}
            className="flex-1 gap-2"
            size="sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
