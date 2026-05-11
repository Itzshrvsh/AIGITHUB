import { statusTracker } from "@/lib/status-tracker";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    jobs: statusTracker.getActiveJobs(),
    logs: statusTracker.getLogs(),
  });
}
