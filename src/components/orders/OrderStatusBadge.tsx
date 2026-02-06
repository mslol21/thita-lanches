import { Badge } from '@/components/ui/badge';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { Clock, ChefHat, Truck, CheckCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<OrderStatus, { icon: React.ElementType; className: string }> = {
  pending: {
    icon: Clock,
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  preparing: {
    icon: ChefHat,
    className: 'bg-primary/20 text-primary border-primary/30',
  },
  ready: {
    icon: CheckCircle,
    className: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  },
  delivered: {
    icon: CheckCircle,
    className: 'bg-success/20 text-success border-success/30',
  },
  pending_payment: {
    icon: Clock,
    className: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  },
  cancelled: {
    icon: Clock,
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
};

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} gap-1.5 font-medium`}
    >
      <Icon className="h-3.5 w-3.5" />
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
