import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/layout/empty-state';

export function TaskDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Task detail" description="Detailed task routing is wired, ready for future data hooks." />
      <EmptyState
        icon={<FileText className="h-6 w-6" aria-hidden="true" />}
        title="Task detail shell"
        description="This route exists for deep-linking and later task data integration."
      />
    </div>
  );
}