/**
 * Wedding Timeline Data
 * 
 * This file contains the timeline events for the wedding ceremony.
 * Easily update events here without modifying component code.
 * 
 * Icon options: 'users' | 'scissors' | 'heart' | 'camera' | 'utensils' | 'music'
 * Session: 'morning' | 'evening'
 */

import type { TimelineEvent } from '../types/types';

export const defaultTimelineEvents: TimelineEvent[] = [
    {
        id: 'procession',
        time: "7:00 ព្រឹក",
        title: "ពិធីហែជំនូន",
        description: "កូនកំលោះហែជំនូនទៅកាន់គេហដ្ឋានកូនក្រមុំ",
        icon: "users",
        session: "morning"
    },
    {
        id: 'haircut',
        time: "8:30 ព្រឹក",
        title: "ពិធីកាត់សក់",
        description: "ពិធីកាត់សក់បង្កក់សិរីសួស្ដីជូនគូស្វាមីភរិយាថ្មី",
        icon: "scissors",
        session: "morning"
    },
    {
        id: 'blessing',
        time: "10:00 ព្រឹក",
        title: "ពិធីសំពះផ្ទឹម",
        description: "ពិធីចងដៃ និងបាចផ្កាស្លា (ពិធីសំខាន់)",
        icon: "heart",
        session: "morning"
    },
    {
        id: 'reception',
        time: "5:00 ល្ងាច",
        title: "ទទួលភ្ញៀវកិត្តិយស",
        description: "ការមកដល់នៃភ្ញៀវ និងថតរូបអនុស្សាវរីយ៍",
        icon: "camera",
        session: "evening"
    },
    {
        id: 'dinner',
        time: "6:30 ល្ងាច",
        title: "ពិសាភោជនាហារ",
        description: "អញ្ជើញពិសាអាហារ និងស្តាប់តន្ត្រី",
        icon: "utensils",
        session: "evening"
    },
    {
        id: 'cake-dance',
        time: "8:00 ល្ងាច",
        title: "កាត់នំ និង រាំលេងកម្សាន្ត",
        description: "ពិធីកាត់នំ និងរាំលេងសប្បាយរីករាយ",
        icon: "music",
        session: "evening"
    }
];

/**
 * Alternative timeline configuration for different wedding styles
 * You can create multiple timeline configurations and pass them as props
 */
export const alternativeTimelineEvents: TimelineEvent[] = [
    {
        id: 'morning-prep',
        time: "6:00 ព្រឹក",
        title: "ការរៀបចំក្នុងព្រឹក",
        description: "ម៉ាកម៉ាក់ និងការរៀបចំលម្អ",
        icon: "camera",
        session: "morning"
    },
    {
        id: 'ceremony-start',
        time: "9:00 ព្រឹក",
        title: "ពិធីរៀងរាល់ពិធីសំខាន់",
        description: "ពិធីប្រលងលង់ក្នុងវិហារ",
        icon: "heart",
        session: "morning"
    },
    {
        id: 'evening-party',
        time: "6:00 ល្ងាច",
        title: "សម្រាក និងបាល",
        description: "សម្រាក សម្លៀក រៀងរាល់អ្វីដែលជា",
        icon: "music",
        session: "evening"
    }
];

/**
 * Get timeline events by session
 * @param session - 'morning' | 'evening' | 'all'
 * @param events - Timeline events array (defaults to defaultTimelineEvents)
 */
export function getTimelineBySession(
    session: 'morning' | 'evening' | 'all' = 'all',
    events: TimelineEvent[] = defaultTimelineEvents
): TimelineEvent[] {
    if (session === 'all') return events;
    return events.filter(event => event.session === session);
}

/**
 * Merge multiple timeline configurations
 * Useful for combining morning and evening events from different sources
 */
export function mergeTimelines(...timelines: TimelineEvent[][]): TimelineEvent[] {
    return timelines.flat().sort((a, b) => {
        const timeA = parseInt(a.time);
        const timeB = parseInt(b.time);
        return timeA - timeB;
    });
}
