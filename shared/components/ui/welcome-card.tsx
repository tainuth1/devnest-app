"use client";
import { memo } from "react";
import Iridescence from "./i-ride-scence";
import Link from "next/link";

const WelcomeCard = () => {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden rounded-2xl bg-slate-200 p-12 md:flex md:w-1/2">
      <div className="absolute inset-0">
        <Iridescence
          color={[0.87, 0.87, 0.87]}
          mouseReact={false}
          amplitude={0.1}
          speed={0.2}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm font-light text-white/80">You can easily</p>
        <h1 className="mt-2 text-4xl leading-tight font-bold text-white">
          Speed up your work
          <br />
          with our Web App
        </h1>
      </div>

      {/* Access & Contact Section */}
      <div className="relative z-10 mt-8">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Get Access Section */}
          <div className="flex-1 rounded-xl p-4 backdrop-blur-xl transition-all hover:backdrop-blur-3xl">
            <h2 className="mb-3 text-2xl font-bold text-white">Get Access</h2>
            <p className="text-sm leading-relaxed text-white/90">
              Sign up at{" "}
              <Link
                href="http://localhost:3000/signup"
                className="underline transition-colors hover:text-white"
                rel="noopener noreferrer"
              >
                taskify.com
              </Link>{" "}
              to start using the app.
            </p>
          </div>

          {/* Questions Section */}
          <div className="flex-1 rounded-xl p-4 backdrop-blur-xl transition-all hover:backdrop-blur-3xl">
            <h2 className="mb-3 text-2xl font-bold text-white">Questions?</h2>
            <p className="text-sm leading-relaxed text-white/90">
              Reach us at{" "}
              <Link
                href="mailto:info@tainuth.com"
                className="underline transition-colors hover:text-white"
              >
                info@tainuth.com
              </Link>
              <br />
              or contact via{" "}
              <Link
                href="https://t.me/tainuth"
                target="_blank"
                className="underline transition-colors hover:text-white"
              >
                Telegram
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(WelcomeCard);
