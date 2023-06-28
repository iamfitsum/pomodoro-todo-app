import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const todoRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.todo.findMany({
      where: {
        authorId: ctx.userId,
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
