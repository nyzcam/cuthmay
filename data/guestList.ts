export interface Guest {
  khmerName: string;
  englishName?: string;
  title?: string;
  relationship?: string;
  status?: 'pending' | 'sent' | 'confirmed' | 'declined';
}

export const guestList: Record<string, Guest> = {

  "deth-vattana": {
    khmerName: "ដេត វឌ្ឍនា",
    englishName: "Deth Vattana",
    title: "កញ្ញា",
    relationship: "guest",
  },

  "dara": {
    khmerName: "តារា",
    englishName: "dara",
    title: "លោក",
    relationship: "guest",
  },

  "chan-thida": {
    khmerName: "ចាន់ ធីដា",
    englishName: "Chan Thida",
    title: "អ្នកនាង",
    relationship: "friend",
  },

  "heang-sophorn": {
    khmerName: "ហៀង សុផុន",
    englishName: "Heang Sophorn",
    title: "ឯកឧត្តម",
    relationship: "vip",
  },

  "khoun-pinuch": {
    khmerName: "ខួន ពិនុច",
    englishName: "Khoun Pinuch",
    title: "អ្នកនាង",
    relationship: "vip",
  },

  "kimseng-company-team": {
    khmerName: "ក្រុមការងារ គីមសេង",
    englishName: "Kimseng Company Team",
    title: "ក្រុម",
    relationship: "colleague",
  },

  "ly-sopheap": {
    khmerName: "លី សុភាព",
    englishName: "Ly Sopheap",
    title: "លោក",
    relationship: "friend",
  },

  "meach-samphy": {
    khmerName: "មាស សំផី",
    englishName: "Meach Samphy",
    title: "លោកជំទាវ",
    relationship: "vip",
  },

  "pon-leak": {
    khmerName: "ពន្លឺក",
    englishName: "Pon Leak",
    title: "លោក",
    relationship: "family",
  },

  "seth-kompheakmony": {
    khmerName: "សែត កុម្ភម្នី",
    englishName: "Seth Kompheakmony",
    title: "លោក",
    relationship: "family",
  },

  "seths-parents": {
    khmerName: "ឪពុកម្តាយ សែត",
    englishName: "Seth's Parents",
    title: "គ្រួសារ",
    relationship: "immediate-family",
  },

  "sok-sreyneang": {
    khmerName: "សុក ស្រីនាង",
    englishName: "Sok Sreyneang",
    title: "លោកស្រី",
    relationship: "family",
  },

  "soks-parents": {
    khmerName: "ឪពុកម្តាយ សុក",
    englishName: "Sok's Parents",
    title: "គ្រួសារ",
    relationship: "immediate-family",
  },

  "song-rambot": {
    khmerName: "សុង រាំប៉ូ និង ភរិយា",
    englishName: "Song Rambot",
    title: "លោក",
    relationship: "vip",
  },

  "vong-sothea": {
    khmerName: "វង្ស សុធា",
    englishName: "Vong Sothea",
    title: "លោក",
    relationship: "family",
  },

  "yeng-vireak-sumeth": {
    khmerName: "យ៉េង វីរៈសុមេធិ",
    englishName: "Yeng Vireak Sumeth",
    title: "លោក",
    relationship: "vip",
  },

};

/**
 * Get display name for a guest (Khmer name preferred)
 */
export function getGuestDisplayName(guest: Guest): string {
  if (guest.title) {
    return `${guest.title} ${guest.khmerName}`;
  }
  return guest.khmerName;
}

/**
 * Find a guest by slug (key in guestList)
 */
export function findGuestBySlug(slug: string): Guest | null {
  return guestList[slug] || null;
}

/**
 * Get slug from guest name
 */
export function getGuestSlug(khmerName: string, englishName?: string): string {
  const name = (englishName || khmerName).toLowerCase();
  return name
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim();
}

