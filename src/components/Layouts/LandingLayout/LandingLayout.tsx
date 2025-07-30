import { Header } from "@/app/(publicRoutes)/home/NavBar";
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer";
export function BasicLayout(props: { children: React.ReactNode }) {
  return (
    <div>
      {/* <Header /> */}
      <main className="w-full">{props.children}</main>
      <StackedCircularFooter />
    </div>
  );
}
