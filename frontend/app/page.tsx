"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LuSparkles } from "react-icons/lu";
import HomeInputBox from "./components/HomeInputBox";

export default function Home() {
  const images = [
    "/home/img1.jpg",
    "/home/img2.jpg",
    "/home/img3.jpg",
    "/home/img4.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <main className="min-h-screen flex flex-col justify-center px-10 bg-gray-200">
      <div className="flex flex-col justify-center items-center gap-10 w-full -mt-10">
        {/* Header */}
        <div className="w-full flex justify-between items-center animate-fade-in">
          <div className="flex flex-col">
            <div className="flex gap-2">
              <LuSparkles className="w-8 h-8" />
              <h1 className="text-5xl md:text-[8rem] font-bold tracking-tight">
                Itinera
              </h1>
            </div>
            <p className="text-xl md:text-3xl font-light">
              Your journey, perfectly planned
            </p>
          </div>
          <div className="w-1/3">
            <p className="text-lg">
              Get personalized, optimized itineraries designed to maximize your
              experience and minimize travel time.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="w-full relative">
          {/* Background Image */}
          <div className="w-full h-60 relative overflow-hidden rounded-2xl">
            {images.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={`Background ${i + 1}`}
                fill
                priority={i === 0}
                className={`object-cover rounded-2xl absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Search Box */}
          <HomeInputBox />
        </div>
      </div>
    </main>
  );
}
