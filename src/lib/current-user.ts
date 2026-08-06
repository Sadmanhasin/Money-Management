import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getCurrentUser = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
});
