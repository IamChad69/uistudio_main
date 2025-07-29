import { InfiniteSlider } from "./inifinite-slider";

export const LogoCloud = () => {
  return (
    <div className=" max-w-6xl mx-auto">
      <div className="flex flex-col  items-center md:flex-row">
        <div className="inline md:max-w-44 md:border-r md:pr-6">
          <p className="text-end text-sm">
            Compatible with the most popular IDEs
          </p>
        </div>
        <div className="relative py-12 md:w-[calc(100%-11rem)]">
          <InfiniteSlider durationOnHover={20} duration={40} gap={112}>
            <div className="flex">
              <img
                className="mx-auto h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                alt="Nvidia Logo"
                height="20"
                width="auto"
              />
            </div>

            <div className="flex">
              <img
                className="mx-auto h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/column.svg"
                alt="Column Logo"
                height="16"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/github.svg"
                alt="GitHub Logo"
                height="16"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/nike.svg"
                alt="Nike Logo"
                height="20"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                alt="Lemon Squeezy Logo"
                height="20"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/laravel.svg"
                alt="Laravel Logo"
                height="16"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-7 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/lilly.svg"
                alt="Lilly Logo"
                height="28"
                width="auto"
              />
            </div>

            <div className="flex">
              <img
                className="mx-auto h-6 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/openai.svg"
                alt="OpenAI Logo"
                height="24"
                width="auto"
              />
            </div>
          </InfiniteSlider>
        </div>
      </div>
    </div>
  );
};
