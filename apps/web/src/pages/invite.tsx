import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '@/lib/auth-hooks';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await apiClient<{ data: any }>(`/api/v1/invites/${token}`, {
          method: 'GET',
        });
        setInvite(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invite');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    try {
      setLoading(true);
      await apiClient(`/api/v1/invites/${token}/accept`, { method: 'POST' });
      toast.success('Invite accepted successfully!');
      navigate(`/w/${invite.workspace.slug}/dashboard`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invite');
      setError(err.message || 'Failed to accept invite');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invite) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-semibold">Invalid or Expired Invite</h2>
        <p className="text-zinc-500">{error || 'This invite link is no longer valid.'}</p>
        <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center gap-6">
        {invite.workspace.avatarUrl ? (
          <img
            src={invite.workspace.avatarUrl}
            alt={invite.workspace.name}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-2xl font-bold">
            {invite.workspace.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold mb-2">You've been invited!</h1>
          <p className="text-zinc-500">
            You have been invited to join the <strong>{invite.workspace.name}</strong> workspace.
          </p>
        </div>
        <div className="flex gap-4 w-full mt-4">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
            Decline
          </Button>
          <Button className="flex-1" onClick={handleAccept} disabled={loading}>
            {loading ? 'Accepting...' : 'Accept Invite'}
          </Button>
        </div>
      </div>
    </div>
  );
}
