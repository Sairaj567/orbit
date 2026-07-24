export type RealtimeEvent =
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.deleted'
  | 'note.created'
  | 'note.updated'
  | 'note.deleted'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'resource.created'
  | 'resource.updated'
  | 'resource.deleted'
  | 'member.invited'
  | 'member.joined'
  | 'member.updated'
  | 'member.removed'
  | 'member.created'
  | 'member.deleted'
  | 'project.member.added'
  | 'project.member.updated'
  | 'project.member.removed'
  | 'habit.created'
  | 'habit.updated'
  | 'habit.completed'
  | 'habit.deleted'
  | 'activity.created'
  | 'studyBlock.created'
  | 'studyBlock.updated'
  | 'studyBlock.deleted';

export interface RealtimePayload<T = unknown> {
  workspaceId: string;
  projectId?: string;
  event: RealtimeEvent;
  payload: T;
  actorId?: string; // To avoid processing events triggered by self if desired
}

// Map specific events to payloads if needed for strong typing on the frontend
export type RealtimeEventPayloads = {
  [K in RealtimeEvent]: unknown;
};
