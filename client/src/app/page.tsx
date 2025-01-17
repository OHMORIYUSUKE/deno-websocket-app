"use client";

import dynamic from "next/dynamic";

const ClientComponent = dynamic(
  () => import("./ClientComponent").then((mod) => mod.ClientComponent),
  {
    ssr: false,
  }
);

const Page = () => {
  return (
    <>
      <ClientComponent />
    </>
  );
};

export default Page;
