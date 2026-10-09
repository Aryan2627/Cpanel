/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It handles standard logic and rendering.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import { redirect } from 'next/navigation';

/**
 * Renders the main Home component.
 * This component handles its own local state and orchestrates user interactions.
 */
export default function Home() {
  redirect('/login');
}
