import Script from "next/script";

export default function GoogleAdsense() {
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7554208332966422"
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
