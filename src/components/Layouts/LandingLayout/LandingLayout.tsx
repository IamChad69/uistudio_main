import { Header } from "@/app/(publicRoutes)/home/Header";
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer";
export function BasicLayout(props: { children: React.ReactNode }) {
  return (
    <div>
      <main className="isolate min-h-screen">{props.children}</main>
      <StackedCircularFooter />
    </div>
  );
}
