/**
 * Hero Section Data
 * 
 * Contains all text, dates, and configuration for the Hero section.
 * Easily update wedding details here without modifying component code.
 */

export interface HeroData {
  title: string;
  subtitle: string;
  invitation: string;
  honorifics: string;
  eventDate: {
    day: string;
    dayOfWeek: string;
    month: string;
    year: string;
    time: string;
  };
  location: string;
}

export const defaultHeroData: HeroData = {
  title: "សិរីសួស្ដីអាពាហ៍ពិពាហ៍",
  subtitle: "សូមគោរមអញ្ជើញ",
  invitation: "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា",
  honorifics: "សូមគោរមអញ្ជើញ",
  eventDate: {
    day: "១៧",
    dayOfWeek: "អាទិត្យ",
    month: "មេសា",
    year: "២០២៦",
    time: "៦ៈ០០ ល្ងាច",
  },
  location: "នៅគេហដ្ឋានខាងស្រី",
};

/**
 * Alternative hero configurations for different events
 */
export const alternativeHeroData: HeroData = {
  title: "សិរីសួស្ដីអាពាហ៍ពិពាហ៍",
  subtitle: "សូមគោរមអញ្ជើញ",
  invitation: "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា",
  honorifics: "សូមគោរមអញ្ជើញ",
  eventDate: {
    day: "១៧",
    dayOfWeek: "អាទិត្យ",
    month: "មេសា",
    year: "២០២៦",
    time: "៦ៈ០០ ល្ងាច",
  },
  location: "នៅគេហដ្ឋានខាងស្រី",
};

/**
 * Get hero data by configuration name
 */
export function getHeroData(configName: string = 'default'): HeroData {
  const configs: Record<string, HeroData> = {
    default: defaultHeroData,
    alternative: alternativeHeroData,
  };
  return configs[configName] || defaultHeroData;
}

/**
 * Format event date as display string
 */
export function formatEventDate(eventDate: HeroData['eventDate']): string {
  return `ថ្ងៃ ${eventDate.dayOfWeek} ទី ${eventDate.day} ខែ ${eventDate.month} ឆ្នាំ ${eventDate.year} វេលាម៉ោង៖ ${eventDate.time}`;
}
