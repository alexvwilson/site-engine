/**
 * GPT-4.1 Prompts for AI Summary Generation with Classification
 *
 * Classification-based prompts for generating type-specific AI summaries.
 * Uses GPT-4.1 to classify transcript type, then generates appropriate summary.
 */

import OpenAI from "openai";
import { logger } from "@/lib/logger";

export type SummaryType = "meeting_notes" | "youtube_video" | "general";

/**
 * JSON Schema for OpenAI structured output classification
 *
 * Enforces exact response format matching SummaryType union.
 * Uses strict mode to guarantee type-safe responses without manual validation.
 */
const CLASSIFICATION_SCHEMA = {
  name: "transcript_classification",
  strict: true,
  schema: {
    type: "object",
    properties: {
      classification: {
        type: "string",
        enum: ["meeting_notes", "youtube_video", "general"],
        description: "The classified transcript type",
      },
    },
    required: ["classification"],
    additionalProperties: false,
  },
} as const;

/**
 * Classify transcript type using GPT-4.1 with structured outputs
 *
 * Analyzes transcript content and returns classification:
 * - meeting_notes: Business meetings, standups, team calls, interviews
 * - youtube_video: Video content, tutorials, presentations, talks
 * - general: Podcasts, conversations, lectures, other content
 *
 * Uses OpenAI's structured outputs with JSON Schema to guarantee
 * type-safe responses without manual validation or fallback logic.
 *
 * @param transcriptText - Full transcript text to classify
 * @returns Classification type (meeting_notes | youtube_video | general)
 * @throws Error if OpenAI returns empty response or fails to classify
 */
export async function classifyTranscript(
  transcriptText: string,
): Promise<SummaryType> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const classificationPrompt = `Analyze this transcript and classify it into ONE of these categories:

1. **meeting_notes**: Business meetings, standups, team calls, interviews, work discussions
2. **youtube_video**: Video content, tutorials, presentations, talks, educational content
3. **general**: Podcasts, conversations, lectures, other audio content

Look for these indicators:
- Meeting notes: Multiple speakers, action items, decisions, "let's", "we should", meeting agenda
- YouTube video: Single speaker presenting, tutorial language, "today we'll", "in this video"
- General: Conversational tone, interview format, storytelling, podcast structure

Transcript preview (first 2000 characters):
${transcriptText.substring(0, 2000)}

Classify the transcript and provide your reasoning.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content:
          "You are a content classifier. Analyze transcripts and classify them accurately.",
      },
      {
        role: "user",
        content: classificationPrompt,
      },
    ],
    temperature: 0.3, // Low temperature for consistent classification
    response_format: {
      type: "json_schema",
      json_schema: CLASSIFICATION_SCHEMA,
    },
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      "OpenAI returned empty response for transcript classification",
    );
  }

  const result = JSON.parse(content) as {
    classification: SummaryType;
  };

  logger.info(
    { classification: result.classification },
    "Transcript classified successfully",
  );

  return result.classification;
}

/**
 * Meeting Notes Prompt Template
 *
 * Generates structured meeting notes with action items and decisions.
 */
const MEETING_NOTES_PROMPT = `Generate comprehensive meeting notes in markdown format:

# [Meeting Title/Topic]

## Meeting Purpose
Brief 1-2 sentence overview of the meeting's objective.

## Key Takeaways
- 3-5 most important decisions or insights
- Focus on actionable outcomes
- Highlight any consensus reached

## Discussion Topics
### [Topic 1]
- Main points discussed
- Relevant context and details
- Any concerns or questions raised

### [Topic 2]
- Main points discussed
- Relevant context and details

(Continue for all major topics)

## Decisions Made
- Key decision 1: [Description and rationale]
- Key decision 2: [Description and rationale]
- Document any disagreements or alternatives considered

## Action Items
- Task description (Owner/Team if mentioned, or "Team")
- Task description (Owner/Team if mentioned)
- Format: "Action verb + task + owner"
- Include deadlines if mentioned

## Next Steps
- High-level follow-up actions
- Timeline or deadlines mentioned
- Any scheduled follow-up meetings

## Attendees/Participants
(If identifiable from transcript, list participants or note "Multiple participants")

Transcript:
{transcript}

Generate the meeting notes above. Use clear, professional language. Keep action items specific and actionable.`;

/**
 * YouTube Video Prompt Template
 *
 * Generates video summary with chapters and key topics.
 */
const YOUTUBE_VIDEO_PROMPT = `Generate a comprehensive YouTube video summary in markdown format:

# [Video Title/Topic]

## Video Overview
1-2 sentence description of the video's main content and purpose.

## Chapter Breakdown
### [Approximate Timestamp or "Beginning"] - [Chapter Title]
- Key points covered in this section
- Important details or examples
- Techniques or concepts explained

### [Approximate Timestamp or "Middle"] - [Chapter Title]
- Key points covered in this section
- Important details or examples

(Continue for all major sections)

## Main Takeaways
- 3-5 most valuable insights from the video
- Actionable learnings or techniques
- Key concepts explained
- Practical applications

## Key Concepts Explained
- **Concept 1**: Brief explanation of what was taught
- **Concept 2**: Brief explanation
- Focus on educational value

## Target Audience
Who would benefit most from watching this video and why.

## Notable Quotes
> "[Memorable or impactful quote from the video]"

> "[Another notable quote that captures key insight]"

## Resources Mentioned
- Tools, links, or resources referenced in the video
- Books, websites, or other content recommended
- If none mentioned, note "No specific resources mentioned"

## Practical Applications
- How viewers can apply this information
- Next steps for implementing concepts
- Real-world use cases

Transcript:
{transcript}

Generate the video summary above. Make it engaging and informative, as if writing for someone deciding whether to watch the video.`;

/**
 * General Content Prompt Template
 *
 * Generates chronological summary for podcasts, interviews, and general content.
 */
const GENERAL_PROMPT = `Generate a comprehensive summary in markdown format:

# [Content Title]

## Summary
2-3 sentence overview of the entire content covering main themes and purpose.

## Key Points (Chronological Order)
1. **[Point 1]**: Description and context from early in the content
2. **[Point 2]**: Description and context
3. **[Point 3]**: Description and context
4. **[Point 4]**: Description and context
5. **[Point 5]**: Description and context
(Continue for all major points in order they appear)

## Important Moments
- **[Timestamp/Location in content]**: Description of significant moment or turning point
- **[Timestamp/Location]**: Description of impactful discussion or revelation
- **[Timestamp/Location]**: Description of key insight or conclusion

## Main Themes
- **Theme 1**: Brief explanation of recurring topic or idea
- **Theme 2**: Brief explanation
- Connect themes to overall content purpose

## Notable Quotes
> "[Memorable quote from content that captures essence]"

> "[Another impactful quote]"

## Discussion Topics Covered
- Topic 1: Brief description of what was discussed
- Topic 2: Brief description
- Topic 3: Brief description

## Conclusion
Final thoughts or wrap-up of the content. What's the main message or takeaway?

## Who Should Listen/Read This
Description of ideal audience and what they'll gain from this content.

Transcript:
{transcript}

Generate the summary above. Maintain chronological flow and capture the conversational nature of the content.`;

/**
 * Build type-specific prompt for summary generation
 *
 * Selects appropriate prompt template based on transcript classification
 * and inserts the transcript text.
 *
 * @param type - Classification type (meeting_notes | youtube_video | general)
 * @param transcriptText - Full transcript text to summarize
 * @returns Formatted prompt string ready for GPT-4.1
 */
export function buildTypeSpecificPrompt(
  type: SummaryType,
  transcriptText: string,
): string {
  const prompts = {
    meeting_notes: MEETING_NOTES_PROMPT,
    youtube_video: YOUTUBE_VIDEO_PROMPT,
    general: GENERAL_PROMPT,
  };

  const selectedPrompt = prompts[type];
  return selectedPrompt.replace("{transcript}", transcriptText);
}

