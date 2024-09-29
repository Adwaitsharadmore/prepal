"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Home() {
  const features = [
    {
      title: "notes to cheatsheets",
      description: "Effortlessly turn your notes into exam-ready cheatsheets. prepPal condenses your material into clear, bite-sized summaries, helping you focus on the key points so you can study smarter and stress less.",
      image: "/images/feature1.png",
    },
    {
      title: "ask and ace",
      description: "No more sifting through pages—get answers to specific questions in an instant! Easily find answers to specific questions from your notes. prepPal lets you pinpoint key information, helping you understand concepts better and enhancing your study sessions.",
      image: "/images/feature2.png",
    },
    {
      title: "quiz yourself",
      description: "Challenge yourself and reinforce your learning. With prepPal, create quizzes from your notes and test your understanding. Get instant feedback to help you improve and prepare effectively for exams.",
      image: "/images/feature3.png",
    },
  ];

  const testimonials = [
    {
      text: "prepPal saved my life before finals! turning my messy notes into cheat sheets in seconds? LITERAL. GENIUS.",
      author: "Aariya Gage",
      position: "Junior @ ASU",
      image: "/images/aariya.jpg", // Your image path here
      rating: 5,
    },
    {
      text: "can’t believe how I survived without prepPal. it's like having a cheat code for studying!",
      author: "Riya Ubhe",
      position: "Sophomore @ ASU",
      image: "/images/riya.png", // Add image path here
      rating: 4,
    },
    {
      text: "prepPal is the ultimate procrastinator’s dream. i barely studied, and still felt prepared. 10/10!",
      author: "Soohum Kaushik",
      position: "Junior @ ASU",
      image: "/images/soohum.png", // Add image path here
      rating: 5,
    },
    {
      text: "this website makes cramming SO much easier. prepPal turned my chaos into a cheat sheet masterpiece!",
      author: "Adwait More",
      position: "Sophomore @ ASU",
      image: "/images/adwait.png", // Add image path here
      rating: 4,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll(".section");
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-custom-bg bg-gradient-preppal" style={{ backgroundColor: "#000" }}>
      {/*
            <div className="absolute top-20 left-[15px] w-[400px] h-[400px] z-50">
        <Image src="/images/decor1.png" alt="Decorative Image" width={350} height={350} className="object-cover" />
      </div>
      <div className="absolute top-[600px] left-[90px] w-[350px] h-[350px] z-50">
        <Image src="/images/decor2.png" alt="Decorative Image" width={350} height={350} className="object-cover" />
      </div>
      <div className="absolute top-[100px] right-[150px] w-[350px] h-350px] z-50">
        <Image src="/images/decor3.png" alt="Decorative Image" width={350} height={350} className="object-cover" />
      </div>
      
      */}


      {/* Main Section */}
      <div>
        <div className="flex-1 flex bg-gradient-preppal flex-col justify-center items-center section relative z-20">
          <div className="min-h-screen flex-1 flex justify-center items-center flex-col">
            {/* Image above "PrepPal" */}
            <div className="mb-1">
              <Image
                src="/images/file.png" // Replace with the actual path to file.png
                alt="Decorative Image"
                width={275}
                height={275}
                className="object-cover"
              />
            </div>


            <div className="font-semibold text-6xl text-white font-inter mb-2 text-center">
              for last-minute
              <span className="font-semibold text-6xl" style={{ color: "rgba(235, 255, 92, 1)" }}>
                {" "}studies
              </span>
            </div>

            <div className="font text-xl pb-5 pt-2 text-center">
              convert notes to cheatsheets
            </div>

            <Link href='/responsePage'>
              <label className="flex items-center justify-center w-58 p-4 bg-black text-white border rounded-full cursor-pointer hover:bg-custom-hover hover:text-black transition-colors">
                <input type="file" className="hidden" />
                <span className="font-semibold">let's get to studying</span>
              </label>
            </Link>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="min-h-screen bg-black text-white flex justify-center items-center rounded-t-3xl section relative z-20">
        <div className="w-full max-w-6xl p-16 mx-6 my-8">
          <h1 className="text-5xl md:text-6xl font-semibold leading-snug text-center">
            <span style={{ color: "rgba(235, 255, 92, 1)" }}>PrepPal</span> is for when you <br /> totally didn't forget to study.
          </h1>

          <p className="mt-12 pt-8 text-base md:text-xl font-light max-w-4xl mx-auto text-center">
            tailored to the urgent needs of students who find themselves in a time-sensitive predicament starting late for exams and needing to cram while still aiming for academic excellence.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black section relative z-20">
        <div className="container mx-auto px-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row ${index % 2 === 0 ? "md:flex-row-reverse" : ""} items-center mb-16`}
            >
              <div className="md:w-1/2 p-4">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={500}
                  height={300}
                  className="object-cover"
                />
              </div>

              <div className="md:w-1/2 p-4">
                <h3 className="text-4xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-lg text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black text-white section relative z-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-8">What Our Users Say</h2>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            loop={true}
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="p-6 bg-black rounded-lg shadow-lg max-w-sm mx-auto">
                  {/* Reviewer Headshot */}
                  <div className="flex flex-col items-center mb-4">
                    <Image
                      src={testimonial.image || '/images/default-avatar.png'} // Default image if no image is provided
                      alt={testimonial.author}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  </div>

                  {/* Reviewer Name and Position */}
                  <div className="text-center">
                    <p className="mt-2 font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-300">{testimonial.position}</p>
                  </div>

                  {/* Star Rating */}
                  <div className="flex justify-center mb-4 mt-2">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <span key={i} className="text-yellow-500 text-lg">&#9733;</span>
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-lg italic text-center mb-4">
                    "{testimonial.text}"
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
}
