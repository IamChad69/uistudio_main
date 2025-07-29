import ExtensionAuth from "@/components/reUseableLayouts/ExtensionAuth";
import Header from "@/components/reUseableLayouts/Header";
import Sidebar from "@/components/reUseableLayouts/Sidebar";

import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-hidden">
        <Header />
        <ExtensionAuth />
        <div className="flex-1 h-[calc(100vh-4rem)] overflow-auto px-4 mb-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
