"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../lib/ThemeContext";

interface Photo {
  id: number;
  src: string;
  alt: string;
}

const photos: Photo[] = [
  {
    id: 1,
    src: "https://picsum.photos/seed/p1/800/1200",
    alt: "Tall portrait image",
  },
  {
    id: 2,
    src: "https://picsum.photos/seed/p2/1200/800",
    alt: "Wide landscape image",
  },
  {
    id: 3,
    src: "https://picsum.photos/seed/p3/800/800",
    alt: "Square image",
  },
  {
    id: 4,
    src: "https://picsum.photos/seed/p4/800/1000",
    alt: "Another portrait",
  },
  {
    id: 5,
    src: "https://picsum.photos/seed/p5/1000/800",
    alt: "Scenic view",
  },
  {
    id: 6,
    src: "https://picsum.photos/seed/p6/800/1100",
    alt: "Architecture detail",
  },
  {
    id: 7,
    src: "https://picsum.photos/seed/p7/1200/900",
    alt: "Nature shot",
  },
  {
    id: 8,
    src: "https://picsum.photos/seed/p8/800/900",
    alt: "Urban photography",
  },
];

const PhotosGallery: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="flex flex-col items-center mx-auto px-4 sm:px-6 mb-20 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h4 className="font-khmer text-gold text-xl md:text-2xl lg:text-3xl mb-2">
          កម្រង
        </h4>
        <div
          className="w-24 h-0.5 mt-1 mx-auto"
          style={{
            background: `linear-gradient(to right, transparent, ${currentTheme.accent}, transparent)`,
          }}
        />
      </motion.div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 w-full">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: index * 0.1,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-auto object-cover rounded-lg transition-all duration-300"
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.3 },
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PhotosGallery;
