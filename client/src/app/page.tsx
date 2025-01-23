"use client";

import { ThemeProvider } from "@mui/material";
import dynamic from "next/dynamic";
import theme from "./theme";

const ClientComponent = dynamic(
  () => import("./ClientComponent").then((mod) => mod.ClientComponent),
  {
    ssr: false,
  }
);

const Page = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <ClientComponent />
      </ThemeProvider>
    </>
  );
};

export default Page;
