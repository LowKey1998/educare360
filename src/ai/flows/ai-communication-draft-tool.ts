'use server';
/**
 * @fileOverview An AI-powered tool for drafting various communications for an educational institution.
 *
 * - draftCommunication - A function that generates a draft communication based on user input and system data.
 * - CommunicationDraftInput - The input type for the draftCommunication function.
 * - CommunicationDraftOutput - The return type for the draftCommunication function.
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
      'Any additional context or specific instructions for the communication (e.g., 