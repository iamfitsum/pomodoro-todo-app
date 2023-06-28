import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const Navbar = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const { theme, setTheme } = useTheme();
  const userButtonTheme = () => {
    if(theme!=="light"){
      return dark
    }else{
      return undefined
    }
  } 
   //Returns empty div if user is not loaded
  if (!userLoaded) return <div />;
  return (
    <div className="flex h-fit border-b border-zinc-200/10 bg-zinc-400/10 py-3">
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between gap-2">
        {/* logo */}
        <Link href="/" className="flex items-center gap-2">
          <p className="text-transparent bg-clip-text bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] text-2xl font-extrabold">
            PomodoroTodo
          </p>
        </Link>

        {/* actions */}
        <div className="flex items-center space-x-2">
          {isSignedIn ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",
                },
                baseTheme: userButtonTheme(),
              }}
            />
          ) : (
            <Link href="/sign-in" className={buttonVariants()}>
              Sign In
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
