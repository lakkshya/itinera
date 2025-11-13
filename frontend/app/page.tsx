"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HomeInputBox from "./components/HomeInputBox";
import LoadingScreen from "./components/LoadingScreen";

export default function Home() {
  const images = [
    "/home/img1.jpg",
    "/home/img2.jpg",
    "/home/img3.jpg",
    "/home/img4.jpg",
  ];

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div>
      {loading && <LoadingScreen message="Generating places..." />}

      <main className="md:h-screen flex flex-col justify-center gap-10 py-10 lg:py-0 bg-gray-200">
        <div className="w-full h-full flex flex-col lg:justify-center items-center gap-14 lg:gap-10 lg:-mt-10">
          {/* Header */}
          <div className="w-full flex flex-col gap-5 md:flex-row justify-between items-center px-5 lg:px-10 animate-fade-in">
            <div className="flex flex-col items-center md:items-start">
              <Image
                src="/logo.png"
                alt="Itinera Logo"
                width={400}
                height={400}
                className="w-2/3"
              />
              <p className="text-xl md:text-3xl font-light text-center md:text-left">
                Your journey, perfectly planned
              </p>
            </div>

            <div className="w-7/10 md:w-1/3">
              <p className="text-center md:text-left md:text-lg">
                Get personalized, optimized itineraries designed to maximize
                your experience and minimize travel time.
              </p>
            </div>
          </div>

          {/* Content for PC*/}
          <div className="hidden md:flex w-full relative md:px-10">
            {/* Background Image */}
            <div className="w-full h-30 md:h-60 relative overflow-hidden md:rounded-2xl">
              {images.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt={`Background ${i + 1}`}
                  fill
                  priority={i === 0}
                  className={`object-cover md:rounded-2xl absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>

            {/* Search Box */}
            <div className="absolute md:top-50 lg:top-44 left-1/2 -translate-x-1/2 md:w-8/10 lg:w-9/10">
              <HomeInputBox setLoading={setLoading} />
            </div>
          </div>

          {/* Content for Mobile*/}
          <div className="md:hidden w-full px-5 md:px-10">
            {/* Search Box */}
            <div className="">
              <HomeInputBox setLoading={setLoading} />
            </div>
          </div>
        </div>

        <footer className="flex lg:hidden flex-col gap-1 w-full text-center text-sm text-gray-600">
          <span>© {new Date().getFullYear()} Itinera</span>
          <span>Crafted with ✨ by Lakshya Rana</span>
        </footer>
      </main>
    </div>
  );
}
