# Pomodoro-Based To-Do App

This is a web-based to-do list application that implements the Pomodoro Technique, along with an analytics dashboard to track task completion and productivity.



## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)

## Introduction

The Pomodoro-Based To-Do App is designed to help users manage their tasks effectively using the Pomodoro Technique. The Pomodoro Technique is a time management method that breaks work into intervals, typically consisting of 25 minutes of focused work called a "tomato," followed by a 5-minute break. This app allows users to create, view, update, and delete tasks while tracking the time spent on each task.

In addition to task management, the app provides a Pomodoro Timer that helps users stay focused and maintain a productive work schedule. After completing four Pomodoro sessions, a longer break session of 15 minutes is triggered to provide a well-deserved rest.

The app also includes user authentication functionality, allowing users to register for an account using a username and password. Users can also choose to log in using their Google or GitHub accounts. Authentication is implemented using Auth0 and Clerk, providing secure and convenient login options.

To enhance the user experience, the application is built with a clean and user-friendly interface using the shadcnui component library for UI design. The UI is responsive and optimized for desktop and mobile devices. The app offers both light and dark mode options, allowing users to choose their preferred theme.

To help users analyze their productivity, the app features an analytics dashboard. The dashboard includes two charts that provide visualizations of task completion data, breaking it down by months.

## Features

The Pomodoro-Based To-Do App includes the following features:

- **Task Management:** Users can create, view, update, and delete tasks in their to-do list. Each task includes a title, description, due date, and a field to record the number of "tomatoes" spent on that task. Users can also sort and filter tasks based on criteria such as creation date, and title.

- **Pomodoro Timer:** The app includes a timer that allows users to start and stop Pomodoro sessions for each task. The timer counts down from 25 minutes for a work session, followed by a 5-minute break session. After completing four Pomodoro sessions, a longer break session of 15 minutes is triggered.

- **User Authentication:** Users can register for an account on the app using a username and password. Additionally, options for Google and GitHub login are available. Authentication is implemented using Auth0 and Clerk. Once registered, users can log in and log out of their account and view a history of their tasks including the devices they used to log in.

- **UI/UX:** The application features a clean and user-friendly interface built using the shadcnui component library for UI design. The UI is responsive and optimized for desktop and mobile devices, providing an aesthetically pleasing and intuitive user experience. The app offers both light and dark mode options.

- **Analytics Dashboard:** The app includes an analytics dashboard with charts that provide visualizations of task completion data, breaking it down by months.

### Bonus Features

In addition to the core features, the app includes the following bonus feature:

- **Notifications:** The app provides notifications to users when a Pomodoro session ends and when they make changes to task. It notifies users of changes made using toast notifications and end of a Pomodoro session is signaled by a bell sound, ensuring that users stay informed even when focusing on other work.

## Getting Started

Follow the instructions below to set up and run the Pomodoro-Based To-Do App locally.

### Prerequisites

Make sure you have the following software installed on your machine:

- Node.js
- PostgreSQL

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/iamfitsum/pomodoro-todo-app.git
   ```

2. Install dependencies:

   ```bash
   cd pomodoro-todo-app
   npm install
   ```

3. Configure the environment variables:

   - Create a `.env` file in the root directory of the project.
   - Copy the content from `.env.example` to `.env`.
   - Replace the placeholder values with your own configuration details, such as database connection settings and Auth0 credentials.

4. Set up the database:

   - Create a PostgreSQL database for the application.
   - Update the `.env` file with your database credentials.

5. Run database migrations:

   ```bash
   npx prisma db push
   ```

6. Start the application:

   ```bash
   npm run dev
   ```

   The app should now be running locally at `http://localhost:3000`.

## Usage

Once the application is up and running, you can access it through your web browser. Register for a new account or log in using your preferred authentication method. Create tasks, start Pomodoro sessions, and manage your to-do list. Explore the analytics dashboard to gain insights into your task completion and productivity.

## Technologies Used

This Pomodoro-Based To-Do App is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`. It is built using the following technologies:

- Front-end:
  - [Next.js](https://nextjs.org)
  - [shadcn/ui](https://ui.shadcn.com/) (Component Library for UI Design)
  - [Tailwind CSS](https://tailwindcss.com) (Styling)
- Back-end:
  - [tRPC](https://trpc.io)
  - [Prisma](https://prisma.io) (ORM)
  - PostgreSQL (Database)
- Authentication:
  - [Clerk](https://clerk.com/) (User Management) (Username, Password, Google, and GitHub authentication)
- Deployment:
  - [Vercel](https://vercel.com/)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app)

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
