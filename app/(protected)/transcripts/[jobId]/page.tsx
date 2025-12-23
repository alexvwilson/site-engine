import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getTranscriptByJobId } from "@/lib/transcripts";
import TranscriptHeader from "@/components/transcripts/TranscriptHeader";
import TabsWithUrlSync from "@/components/transcripts/TabsWithUrlSync";

interface TranscriptViewerPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function TranscriptViewerPage({
  params,
}: TranscriptViewerPageProps) {
  const { jobId } = await params;
  const userId = await requireUserId();

  const data = await getTranscriptByJobId(jobId, userId);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <TranscriptHeader job={data.job} transcript={data.transcript} />

      <TabsWithUrlSync
        transcript={data.transcript}
        transcriptId={data.transcript.id}
        initialSummary={data.summary}
      />
    </div>
  );
}
