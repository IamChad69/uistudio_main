import { useEffect, useState } from "react";
import { useMotionValue } from "framer-motion";

export const useScroll = (threshold: number = 10) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress =
        scrollY / (document.body.scrollHeight - window.innerHeight);
      scrollYProgress.set(progress);
      setIsScrolled(scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, scrollYProgress]);

  return { isScrolled, scrollYProgress };
};
