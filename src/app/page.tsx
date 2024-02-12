"use client";

import dynamic from "next/dynamic";

import { useEffect, useState } from "react";
import moment from "moment";
import "react-calendar/dist/Calendar.css";
import Link from "next/link";

const Calendar = dynamic(
  () => import("react-calendar").then((w) => w.Calendar),
  {
    ssr: false,
  }
);

interface IStock {
  s: string;
  m: string;
  d: string;
}
interface IMarket {
  m: string;
}

async function getStockData(market: string, date: string): Promise<IStock[]> {
  const res = await fetch(
    `https://vcp-watchlist-api.azurewebsites.net/api/q?m=${market}&d=${date}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  const result = await res.text();
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return JSON.parse(result.replaceAll("'", `"`));
}

async function getMarketData(): Promise<IMarket[]> {
  const res = await fetch(
    `https://vcp-watchlist-api.azurewebsites.net/api/markets`,
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  const result = await res.text();
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return JSON.parse(result.replaceAll("'", `"`));
}

export default function Home() {
  const [value, onChange] = useState<Date>(new Date());
  const [markets, setMarkets] = useState<IMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>("UK");
  const [stockList, setStockList] = useState<IStock[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    if (!markets.length) {
      getMarketData()
        .then((markets) => {
          setMarkets(markets);
        })
        .then(() => {
          getStockData(selectedMarket, moment(value).format("YYYY-MM-DD")).then(
            (data) => {
              console.log("data: ", data);
              setStockList(data);
            }
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      getStockData(selectedMarket, moment(value).format("YYYY-MM-DD"))
        .then((data) => {
          console.log("data: ", data);
          setStockList(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [value, selectedMarket]);

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        width: "100dvw",
        justifyContent: "space-evenly",
        alignItems: "center",
        flexDirection: "column",
      }}
      suppressHydrationWarning
    >
      <Calendar onChange={onChange as any} value={value} />
      {loading ? (
        "Loading..."
      ) : (
        <>
          <select
            value={selectedMarket}
            onChange={(event) => setSelectedMarket(event.target.value)}
          >
            {markets?.map((market, index) => {
              return (
                <option key={`market_${index}`} value={market.m}>
                  {market.m}
                </option>
              );
            })}
          </select>
          <div>
            {stockList && stockList.length > 0
              ? stockList?.map((stock, index) => {
                  return (
                    <li key={`stock_${index}`} style={{ margin: 10 }}>
                      <Link href={`/stock/${stock.s}`}>{stock.s}</Link>
                    </li>
                  );
                })
              : `No stocks found on ${selectedMarket} market on ${moment(
                  value
                ).format("YYYY-MM-DD")}`}
          </div>
        </>
      )}
    </div>
  );
}
