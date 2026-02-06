import { OrderStatus } from '@/types';
import { Clock, ChefHat, Truck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const steps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'pending', label: 'Aguardando', icon: Clock },
  { status: 'preparing', label: 'Em preparo', icon: ChefHat },
  { status: 'ready', label: 'Pronto para retirada', icon: CheckCircle },
  { status: 'delivered', label: 'Finalizado', icon: CheckCircle },
];

const statusOrder: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered'];

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;
          
          return (
            <div 
              key={step.status} 
              className="relative flex flex-col items-center z-10"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground",
                  isCurrent && "ring-4 ring-primary/30 animate-pulse-soft"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span 
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px]",
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
