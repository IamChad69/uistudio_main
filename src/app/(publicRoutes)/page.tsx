import React from "react";
import { HeroSection } from "./home/hero";
import { Header } from "./home/header";

type Props = {};

const page = (props: Props) => {
  return (
    <>
      <Header />
      <HeroSection />
    </>
  );
};

export default page;
