import { ResumeWorkspace } from "@/components/editor/ResumeWorkspace";
import { EditorProvider } from "@/lib/editor/EditorProvider";
import { getDemoResume } from "@/lib/api";

export default async function Home() {
  const resume = await getDemoResume();

  return (
    <EditorProvider initialResume={resume}>
      <ResumeWorkspace />
    </EditorProvider>
  );
}