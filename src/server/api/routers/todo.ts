/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { clerkClient } from "@clerk/nextjs/server";
import type { Todo } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

const filterTodosForClient = (todos: Todo[]) => {
  return todos.map((todo) => {
    return {
      id: todo.id,
      title: todo.title,
    };
  });
};

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const normalizeTimezoneOffsetMinutes = (offsetMinutes?: number) => {
  if (
    typeof offsetMinutes !== "number" ||
    !Number.isFinite(offsetMinutes) ||
    offsetMinutes < -14 * 60 ||
    offsetMinutes > 14 * 60
  ) {
    return 0;
  }
  return Math.trunc(offsetMinutes);
};

const toLocalDateKey = (date: Date, offsetMinutes: number) => {
  const shifted = new Date(
    date.getTime() - offsetMinutes * MILLISECONDS_PER_MINUTE
  );
  return shifted.toISOString().split("T")[0]!;
};

const localDateKeyToUtcStart = (dateKey: string, offsetMinutes: number) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error(`Invalid local date key: ${dateKey}`);
  }
  return new Date(
    Date.UTC(year, month - 1, day) + offsetMinutes * MILLISECONDS_PER_MINUTE
  );
};

const formatPracticeLayer = (layer?: string | null) => {
  if (!layer) return null;
  return layer
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const normalizeConceptList = (concepts: string[]) => {
  return concepts
    .map((concept) => concept.trim().toLowerCase())
    .filter(Boolean)
    .sort();
};

const conceptListsMatch = (left: string[], right: string[]) => {
  if (left.length !== right.length) return false;
  return left.every((concept, index) => concept === right[index]);
};

const cleanDeliberateCoderSummary = ({
  summary,
  layerLabel,
  conceptTags,
}: {
  summary?: string | null;
  layerLabel?: string | null;
  conceptTags: string[];
}) => {
  if (!summary) return null;

  const normalizedLayer = layerLabel?.trim().toLowerCase();
  const normalizedConceptsList = normalizeConceptList(conceptTags);
  const usefulParts = summary
    .split(/\s+·\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const normalizedPart = part.toLowerCase();
      if (
        normalizedLayer &&
        normalizedPart === `layer: ${normalizedLayer}`
      ) {
        return false;
      }
      if (normalizedPart.startsWith("concepts:")) {
        const partConcepts = normalizeConceptList(
          part.slice(part.indexOf(":") + 1).split(",")
        );
        if (conceptListsMatch(partConcepts, normalizedConceptsList)) {
          return false;
        }
      }
      return true;
    });

  return usefulParts.length > 0 ? usefulParts.join(" · ") : null;
};

const getPrimaryEmailAddress = async (authorId: string) => {
  const client = await clerkClient();
  const user = await client.users.getUser(authorId);
  const verifiedEmailAddresses = user.emailAddresses.filter(
    (emailAddress) => emailAddress.verification.status === "verified"
  );
  const primaryEmail =
    verifiedEmailAddresses.find(
      (emailAddress) => emailAddress.id === user.primaryEmailAddressId
    )?.emailAddress ??
    verifiedEmailAddresses[0]?.emailAddress ??
    null;

  const displayName =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username?.trim() ||
    primaryEmail;

  return {
    primaryEmail: primaryEmail?.trim().toLowerCase() ?? null,
    displayName: displayName?.trim() || null,
  };
};

export const todoRouter = createTRPCRouter({
  syncViewerProfile: privateProcedure.mutation(async ({ ctx }) => {
    const profile = await getPrimaryEmailAddress(ctx.userId);

    if (!profile.primaryEmail) {
      throw new Error("No verified email was found for the signed-in user.");
    }

    return ctx.prisma.pomodoroUserProfile.upsert({
      where: {
        authorId: ctx.userId,
      },
      update: {
        primaryEmail: profile.primaryEmail,
        displayName: profile.displayName,
      },
      create: {
        authorId: ctx.userId,
        primaryEmail: profile.primaryEmail,
        displayName: profile.displayName,
      },
    });
  }),
  getAll: privateProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        authorId: ctx.userId,
        hidden: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return filterTodosForClient(todos);
  }),
  getSelectedTodo: privateProcedure
    .input(z.object({ todoId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.todo.findFirst({
        where: {
          id: input.todoId,
          authorId: ctx.userId,
          hidden: false,
        },
      });
    }),
  getTotalTomatoes: privateProcedure.query(async ({ ctx }) => {
    const totalTomatoes = await ctx.prisma.pomodoroSession.count({
      where: {
        authorId: ctx.userId,
      },
    });

    return { totalTomatoes };
  }),
  doneTodosByMonth: privateProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.todo.findMany({
      where: {
        done: true,
        authorId: ctx.userId,
        hidden: false,
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1), // Start of the current year
          lt: new Date(new Date().getFullYear() + 1, 0, 1), // Start of the next year
        },
      },
      select: {
        createdAt: true,
      },
    });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const todosByMonth = Array.from({ length: 12 }, (_, i) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      name: monthNames[i]!,
      total: result.filter((todo) => todo.createdAt.getMonth() === i).length,
    }));

    return todosByMonth;
  }),
  undoneTodosByMonth: privateProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.todo.findMany({
      where: {
        done: false,
        authorId: ctx.userId,
        hidden: false,
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1), // Start of the current year
          lt: new Date(new Date().getFullYear() + 1, 0, 1), // Start of the next year
        },
      },
      select: {
        createdAt: true,
      },
    });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const todosByMonth = Array.from({ length: 12 }, (_, i) => ({
      name: monthNames[i]!,
      total: result.filter((todo) => todo.createdAt.getMonth() === i).length,
    }));

    return todosByMonth;
  }),
  analyticsOverview: privateProcedure.query(async ({ ctx }) => {
    const [todos, pomodoroSessions] = await Promise.all([
      ctx.prisma.todo.findMany({
        where: {
          authorId: ctx.userId,
          hidden: false,
        },
        select: {
          createdAt: true,
          done: true,
          dueDate: true,
          priority: true,
        },
      }),
      ctx.prisma.pomodoroSession.findMany({
        where: {
          authorId: ctx.userId,
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const now = new Date();
    const totalTasks = todos.length;
    const completedTasks = todos.filter((todo) => todo.done).length;
    const completionRate = totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);
    const totalTomatoes = pomodoroSessions.length;
    const focusMinutes = totalTomatoes * 25;
    const overdueOpen = todos.filter(
      (todo) => !todo.done && !!todo.dueDate && todo.dueDate < now
    ).length;

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOf7DaysAgo = new Date(startOfToday);
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);
    const createdLast7Days = todos.filter(
      (todo) => todo.createdAt >= startOf7DaysAgo
    ).length;

    const weekStarts = Array.from({ length: 6 }, (_, index) => {
      const weekStart = new Date(startOfToday);
      weekStart.setDate(startOfToday.getDate() - (5 - index) * 7);
      return weekStart;
    });

    const weeklyTrend = weekStarts.map((weekStart, index) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekTodos = todos.filter((todo) =>
        todo.createdAt >= weekStart && todo.createdAt < weekEnd
      );
      return {
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        done: weekTodos.filter((todo) => todo.done).length,
        open: weekTodos.filter((todo) => !todo.done).length,
        index,
      };
    });
    const weeklyFocusTrend = weekStarts.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekSessions = pomodoroSessions.filter((session) =>
        session.createdAt >= weekStart && session.createdAt < weekEnd
      );
      const tomatoes = weekSessions.length;
      return {
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        tomatoes,
        focusMinutes: tomatoes * 25,
      };
    });

    const priorityDistribution = [
      { priority: "LOW", total: 0 },
      { priority: "MEDIUM", total: 0 },
      { priority: "HIGH", total: 0 },
    ];

    todos.forEach((todo) => {
      if (todo.done) return;
      const normalizedPriority =
        todo.priority === "HIGH" || todo.priority === "MEDIUM"
          ? todo.priority
          : "LOW";
      const target = priorityDistribution.find(
        (item) => item.priority === normalizedPriority
      );
      if (target) target.total += 1;
    });

    return {
      kpis: {
        totalTasks,
        completedTasks,
        completionRate,
        totalTomatoes,
        focusMinutes,
        overdueOpen,
        createdLast7Days,
      },
      weeklyTrend,
      weeklyFocusTrend,
      priorityDistribution,
    };
  }),
  streakHeatmap: privateProcedure
    .input(
      z
        .object({
          timezoneOffsetMinutes: z.number().int().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
    const timezoneOffsetMinutes = normalizeTimezoneOffsetMinutes(
      input?.timezoneOffsetMinutes
    );
    const now = new Date();
    const shiftedNowMs =
      now.getTime() - timezoneOffsetMinutes * MILLISECONDS_PER_MINUTE;
    const shiftedStartOfToday = new Date(shiftedNowMs);
    shiftedStartOfToday.setUTCHours(0, 0, 0, 0);
    const shiftedStartMs =
      shiftedStartOfToday.getTime() - 34 * MILLISECONDS_PER_DAY;
    const startUtc = new Date(
      shiftedStartMs + timezoneOffsetMinutes * MILLISECONDS_PER_MINUTE
    );

    const sessions = await ctx.prisma.pomodoroSession.findMany({
      where: {
        authorId: ctx.userId,
        createdAt: {
          gte: startUtc,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const byDate = new Map<string, number>();
    for (const session of sessions) {
      const key = toLocalDateKey(session.createdAt, timezoneOffsetMinutes);
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }

    const days = Array.from({ length: 35 }, (_, index) => {
      const date = new Date(shiftedStartMs + index * MILLISECONDS_PER_DAY);
      const key = date.toISOString().split("T")[0]!;
      const count = byDate.get(key) ?? 0;
      const intensity = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
      return {
        date: key,
        count,
        intensity,
      };
    });

    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const day = days[i];
      if (!day || day.count <= 0) break;
      currentStreak += 1;
    }

    const totalActiveDays = days.filter((day) => day.count > 0).length;

    return {
      currentStreak,
      totalActiveDays,
      days,
    };
  }),
  streakDateDetails: privateProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        timezoneOffsetMinutes: z.number().int().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const timezoneOffsetMinutes = normalizeTimezoneOffsetMinutes(
        input.timezoneOffsetMinutes
      );
      const start = localDateKeyToUtcStart(
        input.date,
        timezoneOffsetMinutes
      );
      const end = new Date(start.getTime() + MILLISECONDS_PER_DAY);

      const sessions = await ctx.prisma.pomodoroSession.findMany({
        where: {
          authorId: ctx.userId,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
        select: {
          todoId: true,
          source: true,
          externalSyncId: true,
          externalSessionId: true,
          externalSessionLabel: true,
          externalLayer: true,
          externalSummary: true,
          externalConceptTags: true,
        },
      });

      const todoIds = Array.from(new Set(sessions.map((session) => session.todoId)));
      const todos = todoIds.length > 0
        ? await ctx.prisma.todo.findMany({
          where: {
            id: {
              in: todoIds,
            },
            authorId: ctx.userId,
          },
          select: {
            id: true,
            title: true,
            hidden: true,
            source: true,
            externalKey: true,
          },
        })
        : [];

      const metaById = new Map(
        todos.map((todo) => [
          todo.id,
          {
            title: todo.title,
            hidden: todo.hidden,
            source: todo.source ?? "local",
            externalKey: todo.externalKey,
          },
        ])
      );
      const itemMap = new Map<
        string,
        {
          id: string;
          todoId: string;
          title: string;
          sessions: number;
          hidden: boolean;
          source: string;
          externalKey: string | null;
          sourceLabel: string;
          layerLabel: string | null;
          summary: string | null;
          conceptTags: string[];
        }
      >();

      for (const session of sessions) {
        const meta = metaById.get(session.todoId);
        const source = session.source ?? meta?.source ?? "local";
        const groupingKey =
          source === "deliberate_coder_sync"
            ? `dc:${session.externalSessionId ?? session.externalSyncId ?? session.todoId}`
            : `todo:${session.todoId}`;

        const existing = itemMap.get(groupingKey);
        if (existing) {
          existing.sessions += 1;
          continue;
        }

        const conceptTags = session.externalConceptTags
          ? session.externalConceptTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
          : [];

        const layerLabel =
          source === "deliberate_coder_sync"
            ? formatPracticeLayer(session.externalLayer)
            : null;
        const summary =
          source === "deliberate_coder_sync"
            ? cleanDeliberateCoderSummary({
              summary: session.externalSummary,
              layerLabel,
              conceptTags,
            })
            : null;

        itemMap.set(groupingKey, {
          id: groupingKey,
          todoId: session.todoId,
          title:
            source === "deliberate_coder_sync"
              ? session.externalSessionLabel ??
                meta?.title ??
                "Deliberate Coder session"
              : meta?.title ?? "Unknown todo",
          sessions: 1,
          hidden: meta?.hidden ?? false,
          source,
          externalKey: meta?.externalKey ?? null,
          sourceLabel:
            source === "deliberate_coder_sync"
              ? "Deliberate Coder"
              : "Pomodoro Todo",
          layerLabel,
          summary,
          conceptTags,
        });
      }

      const items = Array.from(itemMap.values()).sort(
        (a, b) => b.sessions - a.sessions
      );

      return {
        date: input.date,
        totalSessions: sessions.length,
        items,
      };
    }),
  logPomodoroSession: privateProcedure
    .input(
      z.object({
        todoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.pomodoroSession.create({
        data: {
          authorId: ctx.userId,
          todoId: input.todoId,
        },
      });
    }),
  create: privateProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        duedate: z.date().optional(),
        priority: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const todo = await ctx.prisma.todo.create({
        data: {
          authorId,
          title: input.title,
          description: input.description,
          dueDate: input.duedate,
          priority: input.priority,
        },
      });
      return todo;
    }),
  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        done: z.boolean().optional(),
        duedate: z.date().optional(),
        priority: z.string().optional(),
        tomatoes: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingTodo = await ctx.prisma.todo.findFirst({
        where: {
          id: input.id,
          authorId: ctx.userId,
          hidden: false,
        },
        select: {
          id: true,
        },
      });

      if (!existingTodo) {
        throw new Error("Todo not found");
      }

      const todo = await ctx.prisma.todo.update({
        data: {
          title: input.title,
          description: input.description,
          done: input.done,
          dueDate: input.duedate,
          priority: input.priority,
          tomatoes: input.tomatoes,
        },
        where: {
          id: input.id,
        },
      });
      return todo;
    }),
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingTodo = await ctx.prisma.todo.findFirst({
        where: {
          id: input.id,
          authorId: ctx.userId,
          hidden: false,
        },
        select: {
          id: true,
        },
      });

      if (!existingTodo) {
        throw new Error("Todo not found");
      }

      return ctx.prisma.todo.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
