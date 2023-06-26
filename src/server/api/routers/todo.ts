import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const todoRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.todo.findMany({
        where: {
            authorId: ctx.currentUser.id,
        }
    });
  }),
});
