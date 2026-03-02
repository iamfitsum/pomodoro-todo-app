/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

export const todoRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        authorId: ctx.userId,
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
      return ctx.prisma.todo.findUnique({
        where: {
          id: input.todoId,
        },
      });
    }),
  getTotalTomatoes: privateProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        authorId: ctx.userId,
      },
    });

    const totalTomatoes = todos.reduce(
      (acc, todo) => acc + (todo.tomatoes ?? 0),
      0
    );

    return { totalTomatoes };
  }),
  doneTodosByMonth: privateProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.todo.findMany({
      where: {
        done: true,
        authorId: ctx.userId,
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
    const todos = await ctx.prisma.todo.findMany({
      where: {
        authorId: ctx.userId,
      },
      select: {
        createdAt: true,
        done: true,
        dueDate: true,
        priority: true,
        tomatoes: true,
      },
    });

    const now = new Date();
    const totalTasks = todos.length;
    const completedTasks = todos.filter((todo) => todo.done).length;
    const completionRate = totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);
    const totalTomatoes = todos.reduce(
      (acc, todo) => acc + (todo.tomatoes ?? 0),
      0
    );
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
      const weekTodos = todos.filter((todo) =>
        todo.createdAt >= weekStart && todo.createdAt < weekEnd
      );
      const tomatoes = weekTodos.reduce(
        (acc, todo) => acc + (todo.tomatoes ?? 0),
        0
      );
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
      if (days[i]?.count && days[i].count > 0) currentStreak += 1;
      else break;
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
        },
      });

      const byTodo = new Map<string, number>();
      for (const session of sessions) {
        byTodo.set(session.todoId, (byTodo.get(session.todoId) ?? 0) + 1);
      }

      const todoIds = Array.from(byTodo.keys());
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
          },
        })
        : [];

      const titleById = new Map(todos.map((todo) => [todo.id, todo.title]));
      const items = todoIds
        .map((todoId) => ({
          todoId,
          title: titleById.get(todoId) ?? "Unknown todo",
          sessions: byTodo.get(todoId) ?? 0,
        }))
        .sort((a, b) => b.sessions - a.sessions);

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
      return ctx.prisma.todo.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
