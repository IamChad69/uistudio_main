"use client";

import React from 'react';
import Image from 'next/image';
import { Quote, Linkedin, Twitter } from 'lucide-react';

interface Testimonial {
  name: string;
  handle: string;
  avatar: string;
  time: string;
  text: string;
  verified?: boolean;
  social?: string;
}

interface TestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Brenton",
    handle: "brenton_on_x",
    avatar:
      "https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXs93gRuehx9DRhUJQFaOvc6eNIfumL3kPCSZb",
    time: "1h",
    text: "I can see this being super popular, like going to different design inspiration pages to shop for UI elements.",
    verified: true,
    social: "https://twitter.com/brenton_on_x",
  },
  {
    name: "mrtcarson",
    handle: "u/mrtcarson",
    avatar:
      "https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXIxwZytJR6udFXpTCMhlW38OkYczfQVNDvGJa",
    time: "1d",
    text: "would be nice to have",
    verified: false,
  },
  {
    name: "Alex Rivera",
    handle: "@webdevpro",
    avatar:
      "https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXslCnFAhx9DRhUJQFaOvc6eNIfumL3kPCSZbj",
    time: "6h",
    text: "Turning design inspiration into production code used to be a painful, manual process. Now it's as simple as clicking and exporting. Can't wait to see how this transforms frontend development! 👏",
    verified: false,
  },
  {
    name: "ExplorerIndia",
    handle: "@sup_nim",
    avatar:
      "https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXFI6yMLEOjK3fQzW0d1qu5MLmweAklXi4rYoP",
    time: "1d",
    text: "Can I have the link I have been searching for such a tool.",
    verified: false,
  },
  {
    name: "Schlupp",
    handle: "Impressive-Respond23",
    avatar:
      "https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXslCnFAhx9DRhUJQFaOvc6eNIfumL3kPCSZbj",
    time: "1d",
    text: "nice! where can i get it?  ",
    verified: false,
  },
  {
    name: "Distinct-Oil-3212",
    handle: "u/Distinct-Oil-3212",
    avatar:
      "https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXslCnFAhx9DRhUJQFaOvc6eNIfumL3kPCSZbj",
    time: "7d",
    text: "Good idea! Would love to see a MVP soon!",
    verified: false,
  },
  {
    name: "samsunguser",
    handle: "kingofpyrates",
    avatar:
      "https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXslCnFAhx9DRhUJQFaOvc6eNIfumL3kPCSZbj",
    time: "4d",
    text: "Hey thats nice, can you link it?",
    verified: false,
  },
];

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  // Determine which icon to show based on the handle prefix
  const IconComponent = () => {
    if (testimonial.handle.startsWith('@')) {
      return <Twitter className="w-6 h-6" />;
    } else if (testimonial.handle.startsWith('u/')) {
      return <Quote className="w-6 h-6" />;
    } else {
      return <Linkedin className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex h-full w-full min-w-[320px] flex-col items-start justify-center gap-6 border border-solid border-muted-foreground/10 rounded-[10px] pt-6 pr-6 pb-8 pl-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex h-8 w-8 flex-none flex-col items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-100 relative">
          {testimonial.avatar ? (
            <Image 
              src={testimonial.avatar} 
              alt={`${testimonial.name} avatar`} 
              width={32} 
              height={32} 
              className="w-full absolute"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              {testimonial.name.charAt(0)}
            </div>
          )}
        </div>
        <span className="text-heading-3 font-heading-3 text-muted-foreground">
          <IconComponent />
        </span>
      </div>
      
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6">
        <span className="w-full text-[18px] font-[500] leading-[28px] text-default-font">
          {testimonial.text}
        </span>
      </div>
      
      <div className="flex w-full flex-col flex-wrap items-start">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-[500] leading-[24px] text-default-font">
            {testimonial.name}
          </span>
          {testimonial.verified && (
            <span className="text-blue-500 text-xs">✓</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-[500] leading-[20px] text-muted-foreground">
            {testimonial.handle}
          </span>
          <span className="text-[14px] font-[400] leading-[20px] text-muted-foreground">
            • {testimonial.time}
          </span>
        </div>
      </div>
    </div>
  );
};

const Testimonials = ({ 
  title = "Thousands of designers, founders, and developers build with UiStudio.",
  testimonials = defaultTestimonials 
}: TestimonialsProps) => {
  // Split testimonials into 3 columns for desktop layout
  const columnCount = 3;
  const columns = Array.from({ length: columnCount }, (_, i) => 
    testimonials.filter((_, index) => index % columnCount === i)
  );

  return (
    <div className="flex w-full flex-col items-center justify-center gap-12 pt-24 pb-32">
      <h2 className="w-full whitespace-pre-wrap text-[36px] font-[600] leading-[40px] text-default-font text-center -tracking-[.025em] mobile:text-[32px] mobile:leading-[36px] max-w-[760px] mobile:max-w-[360px]">
        {title}
      </h2>
      
      <div className="flex w-screen items-start justify-center gap-6 max-w-[1008px] overflow-hidden">
        {columns.map((columnTestimonials, columnIndex) => (
          <div key={columnIndex} className="flex grow shrink-0 basis-0 flex-col items-start gap-6 self-stretch">
            {columnTestimonials.map((testimonial, idx) => (
              <TestimonialCard key={`${columnIndex}-${idx}`} testimonial={testimonial} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;