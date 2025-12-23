export interface Guest {
  khmerName: string;
  englishName?: string;
  title?: string;
  relationship?: string;
  plusOnes?: number;
}

export const guestList: Record<string, Guest> = {

  "seth-kompheakmony": {
    khmerName: "សែត កុម្ភម្នី",
    englishName: "Seth Kompheakmony",
    title: "លោក",
    relationship: "family",
  },

  "sok-sreyneang": {
    khmerName: "សុក ស្រីនាង",
    englishName: "Sok Sreyneang",
    title: "លោកស្រី",
    relationship: "family",
  },

  "parents-seth": {
    khmerName: "ឪពុកម្តាយ សែត",
    englishName: "Seth's Parents",
    title: "គ្រួសារ",
    relationship: "immediate-family",
    plusOnes: 0,
  },

  "parents-sok": {
    khmerName: "ឪពុកម្តាយ សុក",
    englishName: "Sok's Parents",
    title: "គ្រួសារ",
    relationship: "immediate-family",
    plusOnes: 0,
  },

  "chan-thida": {
    khmerName: "ចាន់ ធីដា",
    englishName: "Chan Thida",
    title: "អ្នកនាង",
    relationship: "friend",
  },

  "ly-sopheap": {
    khmerName: "លី សុភាព",
    englishName: "Ly Sopheap",
    title: "លោក",
    relationship: "friend",
    plusOnes: 1,
  },

  "kimseng-company": {
    khmerName: "ក្រុមការងារ គីមសេង",
    englishName: "Kimseng Company Team",
    title: "ក្រុម",
    relationship: "colleague",
    plusOnes: 0,
  },

  "heang-sophorn": {
    khmerName: "ហៀង សុផុន",
    englishName: "Heang Sophorn",
    title: "ឯកឧត្តម",
    relationship: "vip",
  },

  "meach-samphy": {
    khmerName: "មាស សំផី",
    englishName: "Meach Samphy",
    title: "លោកជំទាវ",
    relationship: "vip",
  },

  "song-rambot": {
    khmerName: "សុង រាំប៉ូ និង ភរិយា",
    englishName: "Song Rambot",
    title: "លោក",
    relationship: "vip",
  },

};


export const getGuestDisplayName = (guest: Guest): string => {
  if (guest.title && guest.title === "គ្រួសារ") {
    return guest.khmerName;
  }
  return `${guest.title} ${guest.khmerName}`.trim();
};

export const findGuestBySlug = (slug: string): Guest | null => {
  return guestList[slug] || null;
};