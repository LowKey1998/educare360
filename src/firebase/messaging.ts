
'use server';
/**
 * @fileOverview Messaging utilities for handling FCM tokens and permissions.
 */

// Note: This file contains logic intended for client consumption but acts as a bridge.
// Real initialization happens in the layout or client providers.
export const VAPID_KEY = "BPI6_v...PLACEHOLDER_VAPID_KEY..."; // Users must generate this in Firebase Console > Project Settings > Cloud Messaging
