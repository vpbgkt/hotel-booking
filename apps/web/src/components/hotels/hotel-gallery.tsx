'use client';

/**
 * Hotel Gallery Component
 * Full-screen image gallery with lightbox
 */

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  Maximize2 
} from 'lucide-react';

interface HotelGalleryProps {
  images: string[];
  hotelName: string;
}

export function HotelGallery({ images, hotelName }: HotelGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images.length > 0 ? images : ['/placeholder-hotel.jpg'];
  
  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  }, [displayImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  }, [displayImages.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  }, [closeLightbox, goToPrevious, goToNext]);

  return (
    <>
      {/* Gallery Grid */}
      <div className="relative">
        {displayImages.length === 1 ? (
          // Single image
          <div 
            className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden cursor-pointer"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={displayImages[0]}
              alt={hotelName}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
        ) : displayImages.length <= 3 ? (
          // 2-3 images
          <div className="grid grid-cols-2 gap-2 h-[400px] md:h-[500px] rounded-xl overflow-hidden">
            <div 
              className="relative cursor-pointer"
              onClick={() => openLightbox(0)}
            >
              <Image
                src={displayImages[0]}
                alt={hotelName}
                fill
                className="object-cover hover:brightness-95 transition-all"
                priority
              />
            </div>
            <div className="grid grid-rows-2 gap-2">
              {displayImages.slice(1, 3).map((img, idx) => (
                <div 
                  key={idx}
                  className="relative cursor-pointer"
                  onClick={() => openLightbox(idx + 1)}
                >
                  <Image
                    src={img}
                    alt={`${hotelName} - Image ${idx + 2}`}
                    fill
                    className="object-cover hover:brightness-95 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          // 4+ images - Airbnb style grid
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-xl overflow-hidden">
            <div 
              className="col-span-2 row-span-2 relative cursor-pointer"
              onClick={() => openLightbox(0)}
            >
              <Image
                src={displayImages[0]}
                alt={hotelName}
                fill
                className="object-cover hover:brightness-95 transition-all"
                priority
              />
            </div>
            {displayImages.slice(1, 5).map((img, idx) => (
              <div 
                key={idx}
                className="relative cursor-pointer"
                onClick={() => openLightbox(idx + 1)}
              >
                <Image
                  src={img}
                  alt={`${hotelName} - Image ${idx + 2}`}
                  fill
                  className="object-cover hover:brightness-95 transition-all"
                />
                {idx === 3 && displayImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{displayImages.length - 5} photos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Show All Photos Button */}
        {displayImages.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Grid3X3 className="w-4 h-4" />
            Show all {displayImages.length} photos
          </button>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
            onKeyDown={(e) => handleKeyDown(e as unknown as KeyboardEvent)}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
              <span className="text-white text-sm">
                {currentIndex + 1} / {displayImages.length}
              </span>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center p-16">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full"
              >
                <Image
                  src={displayImages[currentIndex]}
                  alt={`${hotelName} - Image ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-2 overflow-x-auto">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0 ${
                      idx === currentIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
