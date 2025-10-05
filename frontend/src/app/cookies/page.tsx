"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

const CookiePolicy = () => {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white-50 text-gray-800 dark:bg-black dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <ThemeToggleButton
          variant="gif"
          url="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXBzcnh6dm40bnpxc3FvdTQ3d2ZvaXNtMjZxdWg1MG40NXQ3dGdyMiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/GV6qq1FbED9r8RSn5b/giphy.gif"
        />
      </header>

      {/* Content */}
      <div className="px-10 sm:px-15 py-10 sm:py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight underline decoration-black dark:decoration-white">
          CryptoIntelX – Cookie Policy
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8">
          Last updated: 2025-09-30
        </p>

        <section className="space-y-8 leading-relaxed text-base sm:text-lg">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small encrypted text files stored on your device when you visit
              a website. CryptoIntelX uses cookies to ensure secure authentication,
              improve threat intelligence dashboards, and provide a personalized
              investigative experience. These files do not store personal information
              unless you explicitly provide it during platform use.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              2. How CryptoIntelX Uses Cookies
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Authentication:</strong> Maintain secure login sessions via{" "}
                <em>AuthKit</em>, ensuring analysts and regulators stay authenticated safely
                while accessing dashboards.
              </li>
              <li>
                <strong>Analytics & Performance:</strong> Monitor usage trends, feature
                adoption, and system load for continuous improvement of the AI
                intelligence platform.
              </li>
              <li>
                <strong>Security:</strong> Detect anomalies, prevent unauthorized access,
                and enforce role-based access control across user sessions.
              </li>
              <li>
                <strong>Preferences:</strong> Remember language (Hindi/English), theme
                mode, and dashboard configurations for smoother investigation continuity.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              3. Managing and Controlling Cookies
            </h2>
            <p>
              You can control, restrict, or delete cookies via your browser or system
              settings at any time. However, disabling essential cookies may disrupt
              authentication and investigative analytics on CryptoIntelX. For best
              performance, we recommend enabling cookies while using secured private
              browsing sessions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              4. Third-Party Cookies
            </h2>
            <p>
              CryptoIntelX integrates secure third-party services for analytics, social
              login, and blockchain API calls. These providers (e.g., Google, GitHub,
              Etherscan, and Telegram alert integration) may place their own cookies to
              enhance functionality. Each of these services follows their respective
              privacy and cookie policies.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              5. Data Protection & Transparency
            </h2>
            <p>
              All cookie data is processed in compliance with India’s{" "}
              <strong>DPDP Act 2023</strong> and global standards such as{" "}
              <strong>GDPR</strong>. No cookie-based tracking data is ever sold or shared
              with third parties for marketing purposes. CryptoIntelX’s cookies serve
              solely for security, usability, and operational analytics.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-sm sm:text-base text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
          This Cookie Policy is part of the{" "}
          <a
            href="/privacy-policy"
            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="/terms"
            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
          >
            Terms of Service
          </a>{" "}
          of CryptoIntelX. For additional queries or compliance requests, contact our{" "}
          <a
            href="/contact"
            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
          >
            Data Protection Officer
          </a>
          .
        </footer>
      </div>
    </main>
  );
};

export default CookiePolicy;
