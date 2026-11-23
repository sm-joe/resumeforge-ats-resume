import { NextRequest } from "next/server";
import { forwardResumeRequest } from "@/lib/server/resumeProxy";

type RouteContext = { params: Promise<{ resumeId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { resumeId } = await context.params;
  return forwardResumeRequest(request, [resumeId]);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { resumeId } = await context.params;
  return forwardResumeRequest(request, [resumeId]);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { resumeId } = await context.params;
  return forwardResumeRequest(request, [resumeId]);
}
