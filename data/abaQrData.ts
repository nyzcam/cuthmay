/**
 * ABA QR Section Data
 * 
 * Contains quotes, merchant info, and configuration for the ABA QR code section.
 */

export interface AbaQrData {
  title: string;
  merchant: string;
  quotes: string[];
}

export const defaultAbaQrData: AbaQrData = {
  title: "សូមពរជ័យគ្រប់ប្រការ",
  merchant: "SET K. & DETH V.",
  quotes: [
    "ថ្ងៃនេះថ្ងៃជា មេបាគ្រប់គ្នា ចូលមកត្រៀបត្រា ជាអធិតេយ្យ ក្នុងមង្គលការ ឱ្យបានសុខា ដល់បុត្រជៀងជាក់។",
    "លោកអើយពាក្យពរ ពិរោះសាទ រុងរឿងសិទ្ធិស័ក្ត ខ្ញុំនឹងថ្លាថ្លែង​ ចាចែងដោយថ្នាក់ ដោយបទជើងជាក់ ជួបចប់វាចារ។",
    "អំបោះששម គួរគាប់ឧត្តម ដូចលួសសុវណ្ណា កកាន់លើកឡើង ថ្កល់ថ្កើងថ្លៃថ្លា ចូលចងហត្ថា ឱ្យអ្នកសុខសាន្ត។",
    "ឱ្យអ្នកបានទី ខ្ពង់ខ្ពស់ឫទ្ធី បរិបូណ៌ថ្កើនថ្កាន អាយុយឺនយូរ កបគូបុរាណ មួយរយឆ្នាំបាន ចៀសចាករោគា។",
    "នីរទុក្ខំ ទោមនស្សំ ឧបទ្ទវា នីរសោកេ រោគេពាធា ស្វាមីភរិយា ហោន្តុសុខំ។",
    "ធនធនា ទាសីទាសា ធនធនំ អស្សធនោ ភោគោឧត្តម បរិសុខ ពហុយសា។",
  ],
};

/**
 * Alternative ABA QR data for different events
 */
export const alternativeAbaQrData: AbaQrData = {
  title: "សូមពរជ័យគ្រប់ប្រការ",
  merchant: "WEDDING GIFT",
  quotes: [
    "ថ្ងៃនេះថ្ងៃជា មេបាគ្រប់គ្នា ចូលមកត្រៀបត្រា ជាអធិតេយ្យ ក្នុងមង្គលការ ឱ្យបានសុខា ដល់បុត្រជៀងជាក់។",
    "លោកអើយពាក្យពរ ពិរោះសាទ រុងរឿងសិទ្ធិស័ក្ត ខ្ញុំនឹងថ្លាថ្លែង​ ចាចែងដោយថ្នាក់ ដោយបទជើងជាក់ ជួបចប់វាចារ។",
  ],
};

/**
 * Get ABA QR data by configuration name
 */
export function getAbaQrData(configName: string = 'default'): AbaQrData {
  const configs: Record<string, AbaQrData> = {
    default: defaultAbaQrData,
    alternative: alternativeAbaQrData,
  };
  return configs[configName] || defaultAbaQrData;
}

/**
 * Get payment link for ABA
 */
export function getAbaPaymentLink(): string {
  return "https://pay.ababank.com/oRF8/miaea0t0";
}

/**
 * Rotate quotes cyclically
 */
export function getNextQuoteIndex(currentIndex: number, totalQuotes: number): number {
  return (currentIndex + 1) % totalQuotes;
}
