import { Navbar } from "./ui/navbar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col px-4 pb-4">{children}</div>
    </main>
  );
};

export default HomeLayout;
