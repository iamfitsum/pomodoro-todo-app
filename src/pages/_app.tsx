import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "~/components/ui/theme-provider";
import Navbar from "~/components/Navbar";
import { TimerProvider } from "~/state/timer/TimerContext";
import { Toaster } from "~/components/ui/toaster"

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
