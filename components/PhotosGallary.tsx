"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../providers/ThemeContext";

interface Photo {
  id: number;
  src: string;
  alt: string;
}

const photos: Photo[] = [
  {
    id: 1,
    src: "https://res.cloudinary.com/djuzggce9/image/upload/v1764323693/40ff102232c5123b984eb9dcb6c2b6b7_zwoekf.jpg",
    alt: "Tall portrait image",
  },
  {
    id: 2,
    src: "https://res.cloudinary.com/djuzggce9/image/upload/v1764323760/c239909af9ad923a4ae3d207cccb3eef_uinxk4.jpg",
    alt: "Wide landscape image",
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/djuzggce9/image/upload/v1764323845/c310081e783e8a16632d3104724943d1_zvcdxu.jpg",
    alt: "Square image",
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/djuzggce9/image/upload/v1764323938/f6c39307e32cee03933e3a6edfef07d8_rchque.jpg",
    alt: "Another portrait",
  },
  {
    id: 5,
    src: "https://res.cloudinary.com/djuzggce9/image/upload/v1764324012/01658af1694e93a17598e4ffa1dd0f7a_do9ljd.jpg",
    alt: "Scenic view",
  },
  {
    id: 6,
    src: "https://res.cloudinary.com/djuzggce9/image/upload/v1764324068/4088d06683cca308a6674a6e4d3db0fd_hbl8nw.jpg",
    alt: "Architecture detail",
  },
  {
    id: 7,
    src: "https://res.cloudinary.com/djuzggce9/image/upload/v1764324134/423cd07c160ae3decd53ff0616709267_vg9dfv.jpg",
    alt: "Nature shot",
  },
  {
    id: 8,
    src: "https://res.cloudinary.com/djuzggce9/image/upload/v1764324225/97e6215d37055f215820ce5cf61608ab_in3xgs.jpg",
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
