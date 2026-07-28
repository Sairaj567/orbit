import {
  PrismaClient,
  ProjectRole,
  ProjectStatus,
  RecurrenceType,
  ResourceType,
  StudyBlockStatus,
  TaskPriority,
  TaskStatus,
  Visibility,
  WorkspaceRole,
} from '@prisma/client';
import { createWorkspaceSchema } from '@orbit/shared';

const prisma = new PrismaClient();

const ids = {
  saira: 'user_demo_saira',
  partner: 'user_demo_partner',
  workspace: 'workspace_demo_orbit',
  sairaMember: 'workspace_member_demo_saira',
  partnerMember: 'workspace_member_demo_partner',
  studyProject: 'project_demo_study',
  homeProject: 'project_demo_home',
  studyProjectSaira: 'project_member_demo_study_saira',
  studyProjectPartner: 'project_member_demo_study_partner',
  homeProjectSaira: 'project_member_demo_home_saira',
  homeProjectPartner: 'project_member_demo_home_partner',
  studyCategory: 'category_demo_study',
  choreCategory: 'category_demo_chores',
  javaTask: 'task_demo_java_generics',
  groceriesTask: 'task_demo_groceries',
  workoutTask: 'task_demo_workout',
  javaResource: 'resource_demo_java_docs',
  homeResource: 'resource_demo_grocery_list',
  javaComment: 'comment_demo_java_1',
  duolingoHabit: 'habit_demo_duolingo',
  readingHabit: 'habit_demo_reading',
  duolingoCompletion: 'habit_completion_demo_duolingo_today',
  readingCompletion: 'habit_completion_demo_reading_today',
  weeklyNote: 'note_demo_weekly_focus',
  activityTask: 'activity_demo_task_created',
  activityHabit: 'activity_demo_habit_completed',
  studyBlock: 'study_block_demo_java',
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

async function main() {
  const now = new Date();

  const saira = await prisma.user.upsert({
    where: { email: 'saira@example.com' },
    update: {
      displayName: 'Saira',
      timezone: 'Asia/Calcutta',
      preferences: {
        theme: 'dark',
        sounds: true,
        animations: true,
        accent: 'violet',
      },
      xp: 420,
      level: 4,
    },
    create: {
      id: ids.saira,
      email: 'saira@example.com',
      passwordHash: 'seeded_dummy_hash',
      displayName: 'Saira',
      timezone: 'Asia/Calcutta',
      preferences: {
        theme: 'dark',
        sounds: true,
        animations: true,
        accent: 'violet',
      },
      xp: 420,
      level: 4,
    },
  });

  const partner = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {
      displayName: 'Partner',
      timezone: 'Asia/Calcutta',
      preferences: {
        theme: 'dark',
        sounds: true,
        animations: true,
        accent: 'teal',
      },
      xp: 275,
      level: 3,
    },
    create: {
      id: ids.partner,
      email: 'partner@example.com',
      passwordHash: 'seeded_dummy_hash',
      displayName: 'Partner',
      timezone: 'Asia/Calcutta',
      preferences: {
        theme: 'dark',
        sounds: true,
        animations: true,
        accent: 'teal',
      },
      xp: 275,
      level: 3,
    },
  });

  const seedSlug = process.env.SEED_WORKSPACE_SLUG || 'orbit-seed-demo';
  let targetSlug = seedSlug;

  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug: targetSlug },
  });

  if (existingWorkspace && existingWorkspace.id !== ids.workspace) {
    console.warn(
      `[Seed] Target slug "${targetSlug}" is owned by a non-seed workspace. Using fallback slug...`,
    );
    targetSlug = `${seedSlug}-system`;
  }

  const workspaceInput = createWorkspaceSchema.parse({
    name: 'Orbit Demo',
    slug: targetSlug,
    description: 'Shared productivity workspace for study, habits, chores, and planning.',
  });

  let workspace;
  try {
    workspace = await prisma.workspace.upsert({
      where: { id: ids.workspace },
      update: {
        name: workspaceInput.name,
        slug: workspaceInput.slug,
        description: workspaceInput.description,
        settings: {
          notifications: { browser: true, discord: false },
          gamification: { xpEnabled: true },
        },
        deletedAt: null,
      },
      create: {
        id: ids.workspace,
        name: workspaceInput.name,
        slug: workspaceInput.slug,
        description: workspaceInput.description,
        inviteCode: `${workspaceInput.slug}-invite`,
        settings: {
          notifications: { browser: true, discord: false },
          gamification: { xpEnabled: true },
        },
      },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const fallbackSlug = `${workspaceInput.slug}-${Date.now()}`;
      console.warn(
        `[Seed] Slug collision detected on upsert (P2002). Retrying with fallback slug "${fallbackSlug}".`,
      );
      workspace = await prisma.workspace.upsert({
        where: { id: ids.workspace },
        update: {
          name: workspaceInput.name,
          slug: fallbackSlug,
          description: workspaceInput.description,
        },
        create: {
          id: ids.workspace,
          name: workspaceInput.name,
          slug: fallbackSlug,
          description: workspaceInput.description,
          inviteCode: `${fallbackSlug}-invite`,
        },
      });
    } else {
      throw error;
    }
  }

  const sairaMember = await prisma.workspaceMember.upsert({
    where: { id: ids.sairaMember },
    update: {
      role: WorkspaceRole.OWNER,
      nickname: 'Saira',
      status: 'ACTIVE',
      userId: saira.id,
      email: saira.email,
    },
    create: {
      id: ids.sairaMember,
      role: WorkspaceRole.OWNER,
      nickname: 'Saira',
      status: 'ACTIVE',
      email: saira.email,
      userId: saira.id,
      workspaceId: workspace.id,
    },
  });

  const partnerMember = await prisma.workspaceMember.upsert({
    where: { id: ids.partnerMember },
    update: {
      role: WorkspaceRole.ADMIN,
      nickname: 'Partner',
      status: 'ACTIVE',
      userId: partner.id,
      email: partner.email,
    },
    create: {
      id: ids.partnerMember,
      role: WorkspaceRole.ADMIN,
      nickname: 'Partner',
      status: 'ACTIVE',
      email: partner.email,
      userId: partner.id,
      workspaceId: workspace.id,
    },
  });

  const studyProject = await prisma.project.upsert({
    where: { id: ids.studyProject },
    update: {
      name: 'Study Sprint',
      description: 'Java, AWS, and LeetCode learning track.',
      icon: 'book-open',
      color: '#8b5cf6',
      status: ProjectStatus.ACTIVE,
      visibility: Visibility.WORKSPACE,
      isArchived: false,
      progress: 35,
      order: 10,
      deletedAt: null,
    },
    create: {
      id: ids.studyProject,
      workspaceId: workspace.id,
      creatorId: saira.id,
      name: 'Study Sprint',
      description: 'Java, AWS, and LeetCode learning track.',
      icon: 'book-open',
      color: '#8b5cf6',
      status: ProjectStatus.ACTIVE,
      visibility: Visibility.WORKSPACE,
      progress: 35,
      order: 10,
    },
  });

  const homeProject = await prisma.project.upsert({
    where: { id: ids.homeProject },
    update: {
      name: 'Home Ops',
      description: 'Shared chores, shopping, and routines.',
      icon: 'home',
      color: '#14b8a6',
      status: ProjectStatus.ACTIVE,
      visibility: Visibility.WORKSPACE,
      isArchived: false,
      progress: 60,
      order: 20,
      deletedAt: null,
    },
    create: {
      id: ids.homeProject,
      workspaceId: workspace.id,
      creatorId: partner.id,
      name: 'Home Ops',
      description: 'Shared chores, shopping, and routines.',
      icon: 'home',
      color: '#14b8a6',
      status: ProjectStatus.ACTIVE,
      visibility: Visibility.WORKSPACE,
      progress: 60,
      order: 20,
    },
  });

  await Promise.all([
    prisma.projectMember.upsert({
      where: { id: ids.studyProjectSaira },
      update: { role: ProjectRole.OWNER },
      create: {
        id: ids.studyProjectSaira,
        projectId: studyProject.id,
        workspaceMemberId: sairaMember.id,
        role: ProjectRole.OWNER,
      },
    }),
    prisma.projectMember.upsert({
      where: { id: ids.studyProjectPartner },
      update: { role: ProjectRole.VIEWER },
      create: {
        id: ids.studyProjectPartner,
        projectId: studyProject.id,
        workspaceMemberId: partnerMember.id,
        role: ProjectRole.VIEWER,
      },
    }),
    prisma.projectMember.upsert({
      where: { id: ids.homeProjectSaira },
      update: { role: ProjectRole.EDITOR },
      create: {
        id: ids.homeProjectSaira,
        projectId: homeProject.id,
        workspaceMemberId: sairaMember.id,
        role: ProjectRole.EDITOR,
      },
    }),
    prisma.projectMember.upsert({
      where: { id: ids.homeProjectPartner },
      update: { role: ProjectRole.OWNER },
      create: {
        id: ids.homeProjectPartner,
        projectId: homeProject.id,
        workspaceMemberId: partnerMember.id,
        role: ProjectRole.OWNER,
      },
    }),
  ]);

  const studyCategory = await prisma.category.upsert({
    where: { id: ids.studyCategory },
    update: {
      name: 'Study',
      color: '#8b5cf6',
    },
    create: {
      id: ids.studyCategory,
      name: 'Study',
      color: '#8b5cf6',
      workspaceId: workspace.id,
    },
  });

  const choreCategory = await prisma.category.upsert({
    where: { id: ids.choreCategory },
    update: {
      name: 'Chores',
      color: '#14b8a6',
    },
    create: {
      id: ids.choreCategory,
      name: 'Chores',
      color: '#14b8a6',
      workspaceId: workspace.id,
    },
  });

  const javaTask = await prisma.task.upsert({
    where: { id: ids.javaTask },
    update: {
      title: 'Java generics deep dive',
      description: 'Review bounded wildcards, variance, and stream pipeline examples.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: addDays(now, 2),
      estimatedDuration: 90,
      actualDuration: null,
      tags: ['java', 'study'],
      rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      timezone: 'Asia/Calcutta',
      recurrenceType: RecurrenceType.FIXED,
      categoryId: studyCategory.id,
      projectId: studyProject.id,
      deletedAt: null,
    },
    create: {
      id: ids.javaTask,
      title: 'Java generics deep dive',
      description: 'Review bounded wildcards, variance, and stream pipeline examples.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: addDays(now, 2),
      estimatedDuration: 90,
      tags: ['java', 'study'],
      rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      timezone: 'Asia/Calcutta',
      recurrenceType: RecurrenceType.FIXED,
      workspaceId: workspace.id,
      creatorId: saira.id,
      categoryId: studyCategory.id,
      projectId: studyProject.id,
    },
  });

  const groceriesTask = await prisma.task.upsert({
    where: { id: ids.groceriesTask },
    update: {
      title: 'Order weekly groceries',
      description: 'Restock staples and fruit for the week.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: addDays(now, 1),
      estimatedDuration: 30,
      tags: ['home', 'shared'],
      categoryId: choreCategory.id,
      projectId: homeProject.id,
      deletedAt: null,
    },
    create: {
      id: ids.groceriesTask,
      title: 'Order weekly groceries',
      description: 'Restock staples and fruit for the week.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: addDays(now, 1),
      estimatedDuration: 30,
      tags: ['home', 'shared'],
      workspaceId: workspace.id,
      creatorId: partner.id,
      categoryId: choreCategory.id,
      projectId: homeProject.id,
    },
  });

  const workoutTask = await prisma.task.upsert({
    where: { id: ids.workoutTask },
    update: {
      title: 'Evening workout',
      description: '30 minutes strength training plus stretching.',
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      actualDuration: 35,
      tags: ['health'],
      categoryId: choreCategory.id,
      projectId: homeProject.id,
      deletedAt: null,
    },
    create: {
      id: ids.workoutTask,
      title: 'Evening workout',
      description: '30 minutes strength training plus stretching.',
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      actualDuration: 35,
      tags: ['health'],
      workspaceId: workspace.id,
      creatorId: partner.id,
      categoryId: choreCategory.id,
      projectId: homeProject.id,
    },
  });

  await Promise.all([
    prisma.taskAssignee.upsert({
      where: { taskId_userId: { taskId: javaTask.id, userId: saira.id } },
      update: {},
      create: { taskId: javaTask.id, userId: saira.id },
    }),
    prisma.taskAssignee.upsert({
      where: { taskId_userId: { taskId: groceriesTask.id, userId: saira.id } },
      update: {},
      create: { taskId: groceriesTask.id, userId: saira.id },
    }),
    prisma.taskAssignee.upsert({
      where: { taskId_userId: { taskId: groceriesTask.id, userId: partner.id } },
      update: {},
      create: { taskId: groceriesTask.id, userId: partner.id },
    }),
    prisma.taskAssignee.upsert({
      where: { taskId_userId: { taskId: workoutTask.id, userId: partner.id } },
      update: {},
      create: { taskId: workoutTask.id, userId: partner.id },
    }),
  ]);

  await prisma.taskComment.upsert({
    where: { id: ids.javaComment },
    update: {
      content: 'Added Oracle docs and a recurring study cadence.',
    },
    create: {
      id: ids.javaComment,
      content: 'Added Oracle docs and a recurring study cadence.',
      taskId: javaTask.id,
      authorId: saira.id,
    },
  });

  await Promise.all([
    prisma.resource.upsert({
      where: { id: ids.javaResource },
      update: {
        title: 'Java Generics Tutorial',
        url: 'https://docs.oracle.com/javase/tutorial/java/generics/',
        type: ResourceType.WEBSITE,
        metadata: { source: 'oracle' },
        projectId: studyProject.id,
        taskId: javaTask.id,
      },
      create: {
        id: ids.javaResource,
        workspaceId: workspace.id,
        title: 'Java Generics Tutorial',
        url: 'https://docs.oracle.com/javase/tutorial/java/generics/',
        type: ResourceType.WEBSITE,
        metadata: { source: 'oracle' },
        projectId: studyProject.id,
        taskId: javaTask.id,
      },
    }),
    prisma.resource.upsert({
      where: { id: ids.homeResource },
      update: {
        title: 'Weekly grocery list',
        url: null,
        type: ResourceType.MARKDOWN,
        metadata: { items: ['rice', 'fruit', 'vegetables'] },
        projectId: homeProject.id,
        taskId: groceriesTask.id,
      },
      create: {
        id: ids.homeResource,
        workspaceId: workspace.id,
        title: 'Weekly grocery list',
        url: null,
        type: ResourceType.MARKDOWN,
        metadata: { items: ['rice', 'fruit', 'vegetables'] },
        projectId: homeProject.id,
        taskId: groceriesTask.id,
      },
    }),
  ]);

  const duolingoHabit = await prisma.habit.upsert({
    where: { id: ids.duolingoHabit },
    update: {
      title: 'Duolingo',
      description: 'Daily language practice.',
      color: '#22c55e',
      icon: 'languages',
      rrule: 'FREQ=DAILY',
      timezone: 'Asia/Calcutta',
      recurrenceType: RecurrenceType.FIXED,
      streak: 12,
      longestStreak: 18,
      completionCount: 42,
      lastCompletedAt: now,
      archived: false,
    },
    create: {
      id: ids.duolingoHabit,
      workspaceId: workspace.id,
      projectId: studyProject.id,
      title: 'Duolingo',
      description: 'Daily language practice.',
      color: '#22c55e',
      icon: 'languages',
      rrule: 'FREQ=DAILY',
      timezone: 'Asia/Calcutta',
      recurrenceType: RecurrenceType.FIXED,
      streak: 12,
      longestStreak: 18,
      completionCount: 42,
      lastCompletedAt: now,
    },
  });

  const readingHabit = await prisma.habit.upsert({
    where: { id: ids.readingHabit },
    update: {
      title: 'Reading',
      description: 'Read at least 20 minutes.',
      color: '#60a5fa',
      icon: 'book',
      rrule: 'FREQ=DAILY',
      timezone: 'Asia/Calcutta',
      recurrenceType: RecurrenceType.FIXED,
      streak: 5,
      longestStreak: 9,
      completionCount: 20,
      lastCompletedAt: now,
      archived: false,
    },
    create: {
      id: ids.readingHabit,
      workspaceId: workspace.id,
      projectId: homeProject.id,
      title: 'Reading',
      description: 'Read at least 20 minutes.',
      color: '#60a5fa',
      icon: 'book',
      rrule: 'FREQ=DAILY',
      timezone: 'Asia/Calcutta',
      recurrenceType: RecurrenceType.FIXED,
      streak: 5,
      longestStreak: 9,
      completionCount: 20,
      lastCompletedAt: now,
    },
  });

  await Promise.all([
    prisma.habitCompletion.upsert({
      where: { id: ids.duolingoCompletion },
      update: { completedAt: now },
      create: {
        id: ids.duolingoCompletion,
        habitId: duolingoHabit.id,
        completedAt: now,
      },
    }),
    prisma.habitCompletion.upsert({
      where: { id: ids.readingCompletion },
      update: { completedAt: now },
      create: {
        id: ids.readingCompletion,
        habitId: readingHabit.id,
        completedAt: now,
      },
    }),
  ]);

  const weeklyNote = await prisma.note.upsert({
    where: { id: ids.weeklyNote },
    update: {
      title: 'Weekly focus',
      content:
        '# Weekly focus\n\n- Finish Java generics review\n- Keep Duolingo streak alive\n- Prep weekend grocery list',
      isPinned: true,
      order: 10,
      taskId: javaTask.id,
    },
    create: {
      id: ids.weeklyNote,
      workspaceId: workspace.id,
      projectId: studyProject.id,
      taskId: javaTask.id,
      title: 'Weekly focus',
      content:
        '# Weekly focus\n\n- Finish Java generics review\n- Keep Duolingo streak alive\n- Prep weekend grocery list',
      isPinned: true,
      order: 10,
    },
  });

  await prisma.studyBlock.upsert({
    where: { id: ids.studyBlock },
    update: {
      status: StudyBlockStatus.RUNNING,
      plannedDuration: 90,
      actualDuration: null,
      startedAt: now,
      endedAt: null,
      notes: 'Working through generics examples.',
      taskId: javaTask.id,
      habitId: null,
    },
    create: {
      id: ids.studyBlock,
      workspaceId: workspace.id,
      projectId: studyProject.id,
      taskId: javaTask.id,
      userId: saira.id,
      status: StudyBlockStatus.RUNNING,
      plannedDuration: 90,
      startedAt: now,
      notes: 'Working through generics examples.',
    },
  });

  await Promise.all([
    prisma.activity.upsert({
      where: { id: ids.activityTask },
      update: {
        actorName: saira.displayName,
        entityType: 'TASK',
        entityId: javaTask.id,
        action: 'CREATED',
        metadata: { title: javaTask.title },
      },
      create: {
        id: ids.activityTask,
        workspaceId: workspace.id,
        projectId: studyProject.id,
        userId: saira.id,
        actorName: saira.displayName,
        entityType: 'TASK',
        entityId: javaTask.id,
        action: 'CREATED',
        metadata: { title: javaTask.title },
      },
    }),
    prisma.activity.upsert({
      where: { id: ids.activityHabit },
      update: {
        actorName: partner.displayName,
        entityType: 'HABIT',
        entityId: readingHabit.id,
        action: 'COMPLETED',
        metadata: { title: readingHabit.title },
      },
      create: {
        id: ids.activityHabit,
        workspaceId: workspace.id,
        projectId: homeProject.id,
        userId: partner.id,
        actorName: partner.displayName,
        entityType: 'HABIT',
        entityId: readingHabit.id,
        action: 'COMPLETED',
        metadata: { title: readingHabit.title },
      },
    }),
  ]);

  console.log(
    `Seeded ${workspace.name}: ${studyProject.name}, ${homeProject.name}, ${javaTask.title}, ${weeklyNote.title}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
