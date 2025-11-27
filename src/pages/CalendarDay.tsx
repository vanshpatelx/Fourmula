import { useParams } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DayDetails } from '@/components/calendar/DayDetails';

const CalendarDay = () => {
  const { dayId } = useParams<{ dayId: string }>();

  if (!dayId) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Calendar Day">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Invalid date</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title={`Calendar - ${dayId}`}>
        <DayDetails date={dayId} showBackButton={true} />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CalendarDay;
