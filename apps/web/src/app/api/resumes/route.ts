import { NextRequest } from "next/server";
import { forwardResumeRequest } from "@/lib/server/resumeProxy";

export function GET(request: NextRequest) {
  return forwardResumeRequest(request, []);
}

export function POST(request: NextRequest) {
  return forwardResumeRequest(request, []);
}
