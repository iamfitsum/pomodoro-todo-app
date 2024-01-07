import Link from "next/link";

const WelcomePage = () => {
  return (
    <div className="h-screen">
      <div className="flex h-3/4 flex-col items-center justify-center space-y-10">
        <div className="bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] bg-clip-text pb-3 text-center text-4xl font-bold text-transparent md:text-6xl">
          Welcome, sign in to use PomodoroTodo
        </div>
        <div className="text-4xl md:text-6xl">👋🏾</div>
        <div className="flex flex-col items-center text-center">
          <div className="text-lg font-bold md:text-xl">
            Built with Next.js, tRPC, Clerk, Prisma, Tailwind CSS +more
          </div>
          <div>
            By{" "}
            <Link
              target="_blank"
              href="https://github.com/iamfitsum"
              className="text-[#0ea5e9]"
            >
              Fitsum Mekonnen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage