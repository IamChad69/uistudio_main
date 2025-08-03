import Image from "next/image";

export function BrowserStores() {
  return (
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
    <div className="flex flex-wrap justify-center items-center gap-8">
      <Image
        alt="Chrome Web Store"
        className="shrink-0 transition-transform hover:scale-110"
        height={100}
        src="/Chrome.svg"
        width={100}
      />
      <Image
        alt="Firefox Browser"
        className="shrink-0 transition-transform hover:scale-110"
        height={56}
        src="/firefox-logo.svg"
        width={56}
      />
      <Image
        alt="Edge Browser"
        className="shrink-0 transition-transform hover:scale-110"
        height={100}
        src="/Edge.svg"
        width={100}
      />
      <Image
        alt="Brave Browser"
        className="shrink-0 transition-transform hover:scale-110"
        height={56}
        src="/brave-browser-icon.svg"
        width={56}
      />
    </div>
  </div>
  );
}
