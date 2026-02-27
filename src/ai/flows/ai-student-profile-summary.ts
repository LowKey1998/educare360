'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating an AI-powered summary
 * of a student's key information based on provided details.
 *
 * - aiStudentProfileSummary - A function that triggers the AI student profile summary generation.
 * - AiStudentProfileSummaryInput - The input type for the aiStudentProfileSummary function.
 * - AiStudentProfileSummaryOutput - The return type for the aiStudentProfileSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiStudentProfileSummaryInputSchema = z.object({
  studentName: z.string().describe("The student's full name."),
  medicalConditions: z.string().optional().describe('Any known medical conditions the student has.'),
  specialNeeds: z.string().optional().describe('Any special educational needs or accommodations for the student.'),
  academicProgressHighlights: z.string().optional().describe('Key highlights or summaries of the student\u0027s academic progress.'),
  attendanceIssues: z.string().optional().describe('A summary of any attendance issues the student has faced.'),
});
export type AiStudentProfileSummaryInput = z.infer<typeof AiStudentProfileSummaryInputSchema>;

const AiStudentProfileSummaryOutputSchema = z.string().describe("A concise AI-generated summary of the student's profile.");
export type AiStudentProfileSummaryOutput = z.infer<typeof AiStudentProfileSummaryOutputSchema>;

export async function aiStudentProfileSummary(input: AiStudentProfileSummaryInput): Promise<AiStudentProfileSummaryOutput> {
  return aiStudentProfileSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStudentProfileSummaryPrompt',
  input: { schema: AiStudentProfileSummaryInputSchema },
  output: { schema: AiStudentProfileSummaryOutputSchema },
  prompt: `You are an AI assistant designed to generate concise summaries of student profiles for teachers and administrators.

Generate a brief, clear, and actionable summary of the following student's key information. Focus on providing essential details that a teacher or administrator would need to quickly understand the student and provide better support.

Student Name: {{{studentName}}}

{{#if medicalConditions}}
Medical Conditions: {{{medicalConditions}}}
{{/if}}

{{#if specialNeeds}}
Special Needs: {{{specialNeeds}}}
{{/if}}

{{#if academicProgressHighlights}}
Academic Progress Highlights: {{{academicProgressHighlights}}}
{{/if}}

{{#if attendanceIssues}}
Attendance Issues: {{{attendanceIssues}}}
{{/if}}

AI Student Profile Summary:`,
});

const aiStudentProfileSummaryFlow = ai.defineFlow(
  {
    name: 'aiStudentProfileSummaryFlow',
    inputSchema: AiStudentProfileSummaryInputSchema,
    outputSchema: AiStudentProfileSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
