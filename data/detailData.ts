/**
 * Detail Section Data
 * 
 * Contains parents info, couple details, dates, and directions for the Detail section.
 */

export interface Parent {
  father: string;
  mother: string;
}

export interface Couple {
  groom: string;
  bride: string;
}

export interface DateInfo {
  lunar: string;
  solar: string;
}

export interface Direction {
  id: number;
  description: string;
  detail: string;
  distance?: string; // Dynamic value from motion transforms
}

export interface DetailData {
  parents: Parent[];
  couple: Couple;
  dateInfo: DateInfo;
  directions: Omit<Direction, 'distance'>[];
}

export const defaultDetailData: DetailData = {
  parents: [
    { father: "លោក ម៉ៅ​ គួន", mother: "លោកស្រី ពូន ហុង" },
    { father: "លោក ស្រី ចាន់ដេត", mother: "លោកស្រី យ៉ង សោភ័ណ្ឌ" },
  ],
  couple: {
    groom: "សែត កុម្ភម្នី",
    bride: "ដេត វឌ្ឍនា",
  },
  dateInfo: {
    lunar: "ថ្ងៃអាទិត្យ ១០កើត ខែបុស្ស ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០",
    solar: "ថ្ងៃទី១៧ ខែមករា ឆ្នាំ២០២៧",
  },
  directions: [
    {
      id: 1,
      description: "ចេញពីស្ពានអាកាសចោមចៅ តាមផ្លូវជាតិលេខ ៣ ចម្ងាយប្រមាណ",
      detail:
        "ដល់ខ្លោងទ្វារវត្តសិរីធានីខាងឆ្វេងដៃ រួចបត់ចូលប្រមាណ ១.៥គ.ម លោកអ្នកនឹងទៅដល់ផ្ទះពិធីមង្គលការ។",
    },
    {
      id: 2,
      description: "ចេញពីរង្វង់មូលទុរេន តាមផ្លូវជាតិលេខ ៣ ចម្ងាយប្រមាណ",
      detail:
        "ដល់ខ្លោងទ្វារវត្តសិរីធានីខាងស្ដាំដៃ រួចបត់ចូលប្រមាណ ១.៥គ.ម លោកអ្នកនឹងទៅដល់ផ្ទះពិធីមង្គលការ។",
    },
  ],
};

/**
 * Khmer numerals for number conversion
 */
export const khmerNumerals = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

/**
 * Convert numbers to Khmer numerals
 */
export function toKhmerNumber(num: number): string {
  return num
    .toString()
    .split("")
    .map((d: string) => khmerNumerals[parseInt(d, 10)])
    .join("");
}

/**
 * Get redirect URL for maps
 */
export function getDirectionsMapUrl(): string {
  return `https://maps.app.goo.gl/ZiEYZU2GpxkvH49DA?g_st=ic`;
}

/**
 * Format date info display
 */
export function formatDateInfo(dateInfo: DateInfo): { lunar: string; solar: string } {
  return {
    lunar: dateInfo.lunar,
    solar: dateInfo.solar,
  };
}
