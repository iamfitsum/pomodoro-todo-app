import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";
import Navbar from "~/components/Navbar";
import { ThemeProvider } from "~/components/ui/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { TimerProvider } from "~/state/timer/TimerContext";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: "#0ea5e9",
          },
        }}
        {...pageProps}
      >
        <TimerProvider>
          <Navbar />
          <Component {...pageProps} />
          <Toaster />
        </TimerProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
