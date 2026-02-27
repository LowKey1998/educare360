'use server';
/**
 * @fileOverview A Genkit flow for generating personalized and constructive feedback suggestions for student assessments.
 *
 * - generateAssessmentFeedback - A function that handles the feedback generation process.
 * - AiAssessmentFeedbackInput - The input type for the generateAssessmentFeedback function.
 * - AiAssessmentFeedbackOutput - The return type for the generateAssessmentFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Defines the input schema for the AI assessment feedback generation.
 */
const AiAssessmentFeedbackInputSchema = z.object({
  studentName: z.string().describe("The full name of the student for whom feedback is being generated."),
  assessmentName: z.string().describe("The name or title of the assessment (e.g., 'Chapter 3 Math Quiz', 'Essay on World War II')."),
  gradeOrScore: z.string().describe("The student's grade or score on the assessment (e.g., '85%', 'B+', '35/40', 'Needs Improvement')."),
  learningObjectives: z.string().describe("A summary of the key learning objectives or skills the assessment was designed to evaluate."),
  strengths: z.string().describe("A detailed description of the student's observed strengths or areas where they performed well. Be specific."),
  weaknesses: z.string().describe("A detailed description of the student's observed weaknesses, common errors, or areas where they struggled. Be specific."),
  additionalContext: z.string().optional().describe("Any additional context, specific instructions, or particular aspects the teacher wants the AI to focus on in the feedback."),
});
export type AiAssessmentFeedbackInput = z.infer<typeof AiAssessmentFeedbackInputSchema>;

/**
 * Defines the output schema for the AI assessment feedback generation.
 */
const AiAssessmentFeedbackOutputSchema = z.object({
  overallFeedback: z.string().describe('A comprehensive, personalized, and encouraging feedback message for the student.'),
  strengthsSummary: z.string().describe('A clear and concise summary of the student\'s key strengths demonstrated in the assessment.'),
  improvementSuggestions: z.array(z.string()).describe('A list of specific, actionable suggestions for improvement, directly linked to identified weaknesses. Each suggestion should be a concise sentence.'),
  nextSteps: z.string().optional().describe('Optional suggestions for next steps or resources for the student to continue their learning and reinforce concepts.'),
});
export type AiAssessmentFeedbackOutput = z.infer<typeof AiAssessmentFeedbackOutputSchema>;

/**
 * Generates personalized and constructive feedback suggestions for student assessments.
 * @param input - The input details for generating assessment feedback.
 * @returns A promise that resolves to the generated assessment feedback.
 */
export async function generateAssessmentFeedback(input: AiAssessmentFeedbackInput): Promise<AiAssessmentFeedbackOutput> {
  return aiAssessmentFeedbackFlow(input);
}

/**
 * Defines the prompt for generating AI assessment feedback.
 * It acts as an expert educational assistant to provide structured feedback.
 */
const aiAssessmentFeedbackPrompt = ai.definePrompt({
  name: 'aiAssessmentFeedbackPrompt',
  input: {schema: AiAssessmentFeedbackInputSchema},
  output: {schema: AiAssessmentFeedbackOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest', // Using a suitable model for structured output
  prompt: `You are an expert educational assistant designed to generate personalized and constructive feedback for student assessments. Your primary goal is to help teachers provide high-quality feedback to students efficiently.\n\nPlease generate comprehensive, personalized, and encouraging feedback for the student based on the following assessment details. Highlight their specific strengths, identify clear areas for improvement, and suggest actionable next steps.\n\n---\nStudent Name: {{{studentName}}}\nAssessment Name: {{{assessmentName}}}\nGrade/Score: {{{gradeOrScore}}}\nLearning Objectives for this assessment: {{{learningObjectives}}}\nStudent's observed strengths: {{{strengths}}}\nStudent's observed weaknesses or areas needing improvement: {{{weaknesses}}}\n{{#if additionalContext}}\nAdditional context or specific teacher instructions: {{{additionalContext}}}\n{{/if}}\n---\n\nWhen generating the feedback, ensure:\n1.  The tone is encouraging and supportive.\n2.  Strengths are clearly articulated and specific.\n3.  Areas for improvement are constructively phrased and offer clear, actionable suggestions.\n4.  The feedback is personalized to the student and assessment context.\n\nPlease provide the output in a structured JSON format matching the following schema. Focus on creating distinct entries for 'overallFeedback', 'strengthsSummary', and a list of 'improvementSuggestions'. If applicable, include 'nextSteps'.\n`,
});

/**
 * Defines the Genkit flow for AI assessment feedback generation.
 * It takes student assessment details and returns structured feedback.
 */
const aiAssessmentFeedbackFlow = ai.defineFlow(
  {
    name: 'aiAssessmentFeedbackFlow',
    inputSchema: AiAssessmentFeedbackInputSchema,
    outputSchema: AiAssessmentFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await aiAssessmentFeedbackPrompt(input);
    if (!output) {
      throw new Error('Failed to generate assessment feedback: No output from prompt.');
    }
    return output;
  }
);
