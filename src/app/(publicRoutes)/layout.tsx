import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex flex-1 flex-col pb-4">{children}</div>
    </main>
  );
};

export default HomeLayout;
