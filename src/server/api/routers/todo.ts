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
