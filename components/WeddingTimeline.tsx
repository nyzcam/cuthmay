"use client";
import { FC, useMemo, useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useTheme } from "../providers/ThemeContext";
import { defaultTimelineEvents } from "../data/timelineData";
import { animationConfigs } from "../config/animationConfig";
import type { TimelineEvent } from "../types/types";
import {
    Clock,
    Music,
    Utensils,
    Heart,
    Camera,
    Users,
    Scissors
} from "lucide-react";

// Icon mapping from string to React component
const iconMap: Record<string, React.ReactNode> = {
    users: <Users className="w-5 h-5" />,
    scissors: <Scissors className="w-5 h-5" />,
    heart: <Heart className="w-5 h-5" />,
    camera: <Camera className="w-5 h-5" />,
    utensils: <Utensils className="w-5 h-5" />,
    music: <Music className="w-5 h-5" />,
};

interface WeddingTimelineProps {
    /**
     * Custom timeline events. If not provided, uses default timeline.
     * @default defaultTimelineEvents
     */
    events?: TimelineEvent[];
    
    /**
     * Filter timeline by session (morning/evening)
     * @default 'all'
     */
    session?: 'morning' | 'evening' | 'all';
    
    /**
     * Custom section title (defaults to 'ពិធីកាល')
     */
    title?: string;
    
    /**
     * Show animations (defaults to true)
     */
    showAnimations?: boolean;
    
    /**
     * Custom animation delays in seconds
     */
    animationConfig?: {
        containerDelay?: number;
        staggerDelay?: number;
        lineAnimationDuration?: number;
        cardAnimationDuration?: number;
    };
}

const WeddingTimeline: FC<WeddingTimelineProps> = ({
    events = defaultTimelineEvents,
    session = 'all',
    title = "ពិធីកាល",
    showAnimations = true,
    animationConfig = {}
}) => {
    const { currentTheme } = useTheme();
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) =>
            setPrefersReducedMotion(e.matches);

        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Filter events by session
    const timelineEvents = useMemo(() => {
        if (session === 'all') return events;
        return events.filter(event => event.session === session);
    }, [events, session]);

    // Animation configuration with defaults
    const animConfig = {
        containerDelay: animationConfig.containerDelay ?? 0.5,
        staggerDelay: animationConfig.staggerDelay ?? 0.25,
        lineAnimationDuration: animationConfig.lineAnimationDuration ?? 2,
        cardAnimationDuration: animationConfig.cardAnimationDuration ?? 0.6,
    };

    // --- Animation Variants ---

    // Use centralized fadeUp variant for consistency with other components
    const fadeUp: Variants = useMemo(() => animationConfigs.fadeUp, []);

    // The Line drawing animation
    const lineVariants: Variants = useMemo(() => ({
        hidden: { height: 0 },
        visible: {
            height: "100%",
            transition: { duration: animConfig.lineAnimationDuration, ease: "easeInOut" }
        }
    }), [animConfig.lineAnimationDuration]);

    // The Cards appearing animation - uses consistent fade up pattern
    const cardVariants: Variants = useMemo(() => ({
        hidden: { opacity: 0, y: 20 },
        visible: (i: number = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * animConfig.staggerDelay,
                duration: animConfig.cardAnimationDuration,
                ease: "easeOut"
            }
        })
    }), [animConfig.staggerDelay, animConfig.cardAnimationDuration]);

    // Controls the sequence: Line starts, then items pop up slowly
    const containerVariants: Variants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                // Wait for containerDelay before starting children, then show next child every staggerDelay
                delayChildren: animConfig.containerDelay,
                staggerChildren: animConfig.staggerDelay,
            },
        },
    }), [animConfig.containerDelay, animConfig.staggerDelay]);

    // Get icon for event
    const getIcon = (iconName: string): React.ReactNode => {
        return iconMap[iconName] || <Clock className="w-5 h-5" />;
    };

    return (
        <section className="w-full py-16 font-khmer overflow-hidden">
            {/* Header */}
            <motion.div
                initial={showAnimations && !prefersReducedMotion ? { opacity: 0, y: -20 } : {}}
                whileInView={showAnimations && !prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 space-y-2"
            >
                <h4
                    className="font-khmer text-gold md:text-2xl lg:text-3xl mb-2 inline-block"
                    style={{ color: currentTheme.accent }}
                >
                    {title}
                </h4>
                <div
                    className="w-24 h-0.5 mt-1 mx-auto"
                    style={{
                        background: `linear-gradient(to right, transparent, ${currentTheme.accent}, transparent)`,
                    }}
                />
            </motion.div>

            {/* Timeline Wrapper */}
            <div className="w-full max-w-4xl mx-auto px-4">
                <motion.div
                    className="relative pb-12"
                    variants={showAnimations && !prefersReducedMotion ? containerVariants : undefined}
                    initial={showAnimations && !prefersReducedMotion ? "hidden" : undefined}
                    whileInView={showAnimations && !prefersReducedMotion ? "visible" : undefined}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 md:-ml-0.5 transform z-0">
                        <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full opacity-50" />
                        
                        <motion.div
                            className="absolute top-0 left-0 w-full rounded-full"
                            style={{ 
                                background: `linear-gradient(to bottom, ${currentTheme.accent})` 
                            }}
                            variants={showAnimations && !prefersReducedMotion ? lineVariants : undefined}
                        />
                    </div>

                    {timelineEvents.map((event, index) => {
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={event.id || index}
                                variants={showAnimations && !prefersReducedMotion ? cardVariants : undefined}
                                custom={index}
                                className={`relative flex items-center mb-12 md:justify-between ${
                                    isEven ? "md:flex-row-reverse" : ""
                                }`}
                            >
                                <div className="hidden md:block w-5/12" />

                                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
                                    <div
                                        className="w-12 h-12 rounded-full border-4 flex items-center justify-center bg-white shadow-lg transition-transform hover:scale-110 duration-500"
                                        style={{
                                            borderColor: currentTheme.accent,
                                        }}
                                    >
                                        <div style={{ color: currentTheme.accent }}>
                                            {getIcon(event.icon)}
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-24 md:ml-0 w-full md:w-5/12">
                                    <div
                                        className="p-6 rounded-2xl shadow-sm border backdrop-blur-sm transition-all duration-500 hover:shadow-md hover:-translate-y-1"
                                        style={{
                                            backgroundColor: `${currentTheme.accent}08`, 
                                            borderColor: `${currentTheme.accent}20`,
                                        }}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-start">
                                                <div
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                                                    style={{
                                                        backgroundColor: `${currentTheme.accent}15`
                                                    }}
                                                >
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-gold">{event.time}</span>
                                                    
                                                </div>
                                            </div>

                                            <div className="text-left">
                                                <h3
                                                    className="text-lg text-gold md:text-xl mb-1"
                                                >
                                                    {event.title}
                                                </h3>
                                                <p className="text-sm text-gold leading-relaxed opacity-80">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default WeddingTimeline;