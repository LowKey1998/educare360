'use server';
/**
 * @fileOverview An AI-powered tool for drafting various communications for an educational institution.
 *
 * - aiCommunicationDraftTool - A function that generates a draft communication based on user input and system data.
 * - CommunicationDraftInput - The input type for the aiCommunicationDraftTool function.
 * - CommunicationDraftOutput - The return type for the aiCommunicationDraftTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CommunicationDraftInputSchema = z.object({
  communicationType: z
    .enum([
      'newsletter',
      'attendance notification',
      'event announcement',
      'general update',
      'other',
    ])
    .describe('The type of communication to draft.'),
  audience: z
    .string()
    .describe(
      'The intended recipients of the communication (e.g., "parents of absent students", "all parents", "teachers").'
    ),
  systemData: z
    .string()
    .optional()
    .describe(
      'Relevant system data (e.g., student names, event details, attendance records summary) as a string. This data will be used to enrich the communication content.'
    ),
  additionalContext: z
    .string()
    .optional()
    .describe(
      'Any additional context or specific instructions for the communication (e.g., "Keep it formal", "Highlight the upcoming sports day").'
    ),
});
export type CommunicationDraftInput = z.infer<typeof CommunicationDraftInputSchema>;

const CommunicationDraftOutputSchema = z.string().describe('The AI-generated draft communication text.');
export type CommunicationDraftOutput = z.infer<typeof CommunicationDraftOutputSchema>;

/**
 * Generates a draft communication based on user input and system data.
 * @param input - The input details for drafting the communication.
 * @returns A promise that resolves to the generated communication draft.
 */
export async function aiCommunicationDraftTool(input: CommunicationDraftInput): Promise<CommunicationDraftOutput> {
  return aiCommunicationDraftToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCommunicationDraftToolPrompt',
  input: {schema: CommunicationDraftInputSchema},
  output: {schema: CommunicationDraftOutputSchema},
  prompt: `You are a professional educational communications assistant. Your task is to draft a clear, professional, and engaging communication based on the following details.

Communication Type: {{{communicationType}}}
Target Audience: {{{audience}}}

{{#if systemData}}
Relevant System Data:
{{{systemData}}}
{{/if}}

{{#if additionalContext}}
Additional Context/Instructions:
{{{additionalContext}}}
{{/if}}

Please ensure the tone is appropriate for a school setting and the intended audience. The draft should be ready to be reviewed and sent by a teacher or administrator.

Draft Communication:`,
});

const aiCommunicationDraftToolFlow = ai.defineFlow(
  {
    name: 'aiCommunicationDraftToolFlow',
    inputSchema: CommunicationDraftInputSchema,
    outputSchema: CommunicationDraftOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate communication draft: No output from AI.');
    }
    return output;
  }
);
