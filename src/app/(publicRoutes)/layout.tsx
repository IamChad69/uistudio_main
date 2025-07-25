import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex flex-1 flex-col px-4 pb-4">{children}</div>
      <StackedCircularFooter />
    </main>
  );
};

export default HomeLayout;
