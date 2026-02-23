import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";
import Head from "next/head";
import Navbar from "~/components/Navbar";
import { ThemeProvider } from "~/components/ui/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { TimerProvider } from "~/state/timer/TimerContext";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <Head>
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: "#0ea5e9",
          },
        }}
      >
        <TimerProvider>
          <div className="flex min-h-screen flex-col md:h-screen md:overflow-hidden">
            <Navbar />
            <div className="flex-1 md:min-h-0">
              <Component {...pageProps} />
            </div>
          </div>
          <Toaster />
        </TimerProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
