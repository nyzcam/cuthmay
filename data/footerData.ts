/**
 * Footer Section Data
 * 
 * Contains footer messages, credits, and configuration.
 */

export interface FooterData {
  thankYouMessage: string;
  thankYouSubtext: string;
  creditText: string;
  creditorName: string;
  creditorUrl: string;
}

export const defaultFooterData: FooterData = {
  thankYouMessage: "សូមអរគុណចំពោះការចូលរួម",
  thankYouSubtext: "ការចូលរួមរបស់លោកអ្នកគឺជាកិត្តិយសយ៉ាងធំសម្រាប់ពួកយើង",
  creditText: "នាំមកជួនដោយ",
  creditorName: "Nyz Cam",
  creditorUrl: "https://nyzcam.vercel.app/",
};

/**
 * Alternative footer configurations
 */
export const alternativeFooterData: FooterData = {
  thankYouMessage: "សូមអរគុណចំពោះការចូលរួម",
  thankYouSubtext: "ការចូលរួមរបស់លោកអ្នកគឺជាកិត្តិយសយ៉ាងធំសម្រាប់ពួកយើង",
  creditText: "ផលិតកម្មដោយ",
  creditorName: "Nyz Cam",
  creditorUrl: "https://nyzcam.vercel.app/",
};

/**
 * Get footer data by configuration name
 */
export function getFooterData(configName: string = 'default'): FooterData {
  const configs: Record<string, FooterData> = {
    default: defaultFooterData,
    alternative: alternativeFooterData,
  };
  return configs[configName] || defaultFooterData;
}

/**
 * Validation for footer data
 */
export function validateFooterData(data: Partial<FooterData>): boolean {
  return !!(
    data.thankYouMessage &&
    data.thankYouSubtext &&
    data.creditText &&
    data.creditorName &&
    data.creditorUrl
  );
}
