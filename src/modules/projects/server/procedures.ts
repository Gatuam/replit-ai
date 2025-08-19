import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import * as randomWordSlugs from "random-word-slugs";

export const projectRouter = createTRPCRouter({
  getmany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: "asc",
      },
    });
    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Prompt is required" }).max(10000, {
          message: "Prompt is too long, need to be under 10000 char ",
        }),
      })
    )
    .mutation(async ({ input }) => {
      const createProject = await prisma.project.create({
        data: {
          name: randomWordSlugs.generateSlug(2, { format: "kebab" }) || "",
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createProject.id,
        },
      });
      return createProject;
    }),
});
