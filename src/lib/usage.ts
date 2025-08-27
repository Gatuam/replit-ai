import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "./db";
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS: number = 2;
const PRO_POINTS: number = 3;
const DURATION: number = 30 * 24 * 60 * 60;
const POINTS_COST: number = 1;

export async function getUsageTracker() {
  const { has } = await auth();
  const hasPremium = has({ plan: "pro" });
  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: hasPremium ? PRO_POINTS : FREE_POINTS,
    duration: DURATION,
  });

  return usageTracker;
}

export const consumeCredit = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated");
  }
  const useageTracker = await getUsageTracker();
  const result = await useageTracker.consume(userId, POINTS_COST);
  return result;
};

export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated");
  }
  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);
  return result;
}
