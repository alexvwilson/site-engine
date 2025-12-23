"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TranscriptContent from "@/components/transcripts/TranscriptContent";
import { AISummaryTab } from "@/components/transcripts/AISummaryTab";
import { AskScriboPanel } from "@/components/transcripts/AskScriboPanel";
import type { Transcript } from "@/lib/drizzle/schema/transcripts";
import type { AiSummary } from "@/lib/drizzle/schema/ai-summaries";

type TabValue = "transcript" | "summary" | "ask-scribo";

interface TabsWithUrlSyncProps {
  transcript: Transcript;
  transcriptId: string;
  initialSummary: AiSummary | null;
}

export default function TabsWithUrlSync({
  transcript,
  transcriptId,
  initialSummary,
}: TabsWithUrlSyncProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timestampToHighlight, setTimestampToHighlight] = useState<
    number | null
  >(null);

  // Read current tab from URL, default to "transcript"
  const currentTab = (searchParams.get("tab") as TabValue) || "transcript";

  // Validate tab value (if invalid, use default)
  const validTab: TabValue =
    currentTab === "transcript" ||
    currentTab === "summary" ||
    currentTab === "ask-scribo"
      ? currentTab
      : "transcript";

  // Handle timestamp parameter from URL
  useEffect(() => {
    const t = searchParams.get("t");
    if (t && !isNaN(Number(t))) {
      setTimestampToHighlight(Number(t));
    } else {
      setTimestampToHighlight(null);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string): void => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs
      value={validTab}
      onValueChange={handleTabChange}
      className="w-full space-y-6"
    >
      <div className="border-b w-full">
        <TabsList className="bg-transparent border-0 p-0 w-fit">
          <TabsTrigger
            value="transcript"
            className="data-[state=active]:text-primary data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none pb-3"
          >
            Transcript
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="data-[state=active]:text-primary data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none pb-3"
          >
            AI Summary
          </TabsTrigger>
          <TabsTrigger
            value="ask-scribo"
            className="data-[state=active]:text-primary data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none pb-3"
          >
            Ask Scribo
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="transcript">
        {/* Full width transcript content */}
        <TranscriptContent
          transcript={transcript}
          highlightTimestamp={timestampToHighlight}
        />
      </TabsContent>

      <TabsContent value="summary">
        {/* AI Summary tab with full width */}
        <AISummaryTab
          transcriptId={transcriptId}
          initialSummary={initialSummary}
        />
      </TabsContent>

      <TabsContent value="ask-scribo" className="mt-6">
        <AskScriboPanel transcriptId={transcriptId} />
      </TabsContent>
    </Tabs>
  );
}
