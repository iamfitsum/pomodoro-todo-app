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
});
