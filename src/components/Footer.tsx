import { Clock } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-zinc-400/10 py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          <Link href="/">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] text-2xl font-extrabold">PomodoroTodo</h2>
          </Link>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Boost your productivity, one tomato at a time.</p>
          <div className="mt-4 flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <span>Made with</span>
            <Clock className="w-4 h-4 text-red-500" />
            <span>by</span>
            <a
              href="https://github.com/iamfitsum"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline text-[#1688c5]"
            >
              Fitsum Mekonnen
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} PomodoroTodo. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer