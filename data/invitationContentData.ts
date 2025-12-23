/**
 * Invitation Content Data
 * 
 * Contains invitation messages and configuration for the InvitationContent section.
 */

import type { HeroData } from './heroData';

export interface InvitationContentData {
  heroData?: HeroData;
  showWelcomeMessage?: boolean;
}

export const defaultInvitationContentData: InvitationContentData = {
  showWelcomeMessage: true,
};

/**
 * Get invitation content data by configuration name
 */
export function getInvitationContentData(configName: string = 'default'): InvitationContentData {
  const configs: Record<string, InvitationContentData> = {
    default: defaultInvitationContentData,
  };
  return configs[configName] || defaultInvitationContentData;
}
