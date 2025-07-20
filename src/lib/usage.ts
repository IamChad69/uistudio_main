import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { RateLimiterPrisma } from "rate-limiter-flexible";

const FREE_POINTS = 3;
const PRO_POINTS = 100;
const DURATION = 30 * 24 * 60 * 60;
const GENERATE_POINTS = 1;

export async function getUsageTracker() {
    const {has} = await auth();
    const hasProAccess= has({plan: "pro"});

  const UsageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: hasProAccess ? PRO_POINTS : FREE_POINTS,
    duration: DURATION, 
  });
  return UsageTracker;
}

export async function consumeCredit() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated");
  }
  const UsageTracker = await getUsageTracker();
  const result = await UsageTracker.consume(userId, GENERATE_POINTS);
  return result;
}

export async function getUsageStatus() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated");
  }
  const UsageTracker = await getUsageTracker();
  const result = await UsageTracker.get(userId);
  return result;
}
