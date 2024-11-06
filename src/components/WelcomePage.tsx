import { BarChart, CheckCircle2, Clock, List } from "lucide-react";
import Link from "next/link";
import { ReactNode } from 'react';
import { Button } from "~/components/ui/button";

const WelcomePage = () => {
  return (
    <div className="text-gray-800 dark:text-white">
      <main className="container mx-auto px-6 py-12 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] font-extrabold">PomodoroTodo</span>
        </h1>
        <p className="text-lg md:text-xl text-center mb-12 max-w-2xl text-gray-600 dark:text-gray-300">
          Boost your productivity with our powerful combination of Pomodoro timer and todo list management.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <FeatureCard
            icon={<Clock className="w-12 h-12 text-[#1688c5]" />}
            title="Pomodoro Timer"
            description="Stay focused with customizable Pomodoro sessions, short breaks, and long breaks."
          />
          <FeatureCard
            icon={<List className="w-12 h-12 text-[#1688c5]" />}
            title="Todo Management"
            description="Organize your tasks efficiently with our intuitive todo list feature."
          />
          <FeatureCard
            icon={<CheckCircle2 className="w-12 h-12 text-[#1688c5]" />}
            title="Track Progress"
            description="Monitor your productivity with total focus sessions and focus time tracking."
          />
          <FeatureCard
            icon={<BarChart className="w-12 h-12 text-[#1688c5]" />}
            title="Analytics"
            description="Gain insights into your productivity patterns with detailed analytics."
          />
        </div>

        <Link href="/signin">
          <Button className="bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg text-lg transition-opacity">
            Get Started Now
          </Button>
        </Link>
      </main>
    </div>
  );
}

export default WelcomePage

function FeatureCard({ icon, title, description }: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
      {icon}
      <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}