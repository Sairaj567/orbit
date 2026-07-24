import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  trend?: ReactNode;
}

export function StatCard({ label, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
        </div>
        {icon ? <div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div> : null}
      </CardHeader>
      <CardContent className="space-y-2">
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {trend ? <div>{trend}</div> : null}
      </CardContent>
    </Card>
  );
}
