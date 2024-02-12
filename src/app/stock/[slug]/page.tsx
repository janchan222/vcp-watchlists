"use client";
import dynamic from "next/dynamic";

const SymbolOverviewNoSSR = dynamic(
  () =>
    import("react-ts-tradingview-widgets").then((w) => w.AdvancedRealTimeChart),
  {
    ssr: false,
  }
);

export default function TradingViewPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div
      style={{
        height: "calc(100dvh - 40px)",
        width: "calc(100dvw - 20px)",
      }}
      suppressHydrationWarning
    >
      <SymbolOverviewNoSSR
        autosize
        style={"1"}
        interval={"D"}
        theme={"dark"}
        symbol={params.slug}
      />
    </div>
  );
}
