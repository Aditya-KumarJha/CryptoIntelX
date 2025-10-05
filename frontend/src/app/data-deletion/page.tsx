"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

const DataDeletion = () => {
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
          url="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWI1ZmNvMGZyemhpN3VsdWp4azYzcWUxcXIzNGF0enp0eW1ybjF0ZyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/Fa6uUw8jgJHFVS6x1t/giphy.gif"
        />
      </header>

      {/* Content */}
      <div className="px-10 sm:px-15 py-10 sm:py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight underline decoration-black dark:decoration-white">
          CryptoIntelX – Data Deletion Policy
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8">
          Last updated: 2025-08-28
        </p>

        <section className="space-y-8 leading-relaxed text-base sm:text-lg">
          <p>
            At <strong>CryptoIntelX</strong>, we value transparency and user control over
            personal data. You may request deletion of your account and related data
            at any time. Upon verification, we will permanently erase or anonymize
            your data, except where retention is required by law or security compliance
            standards.
          </p>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              Option A – In-App Deletion
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Sign in to your <strong>CryptoIntelX</strong> dashboard.</li>
              <li>
                Navigate to <strong>Settings → Account → Data & Privacy → Delete Account</strong>.
              </li>
              <li>
                Review the summary of data that will be deleted and confirm your request.
              </li>
              <li>
                You’ll receive an email confirming successful deletion within 7 business days.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              Option B – Email Deletion Request
            </h2>
            <p>
              If you prefer, you may also submit a deletion request manually by sending
              an email with the subject line{" "}
              <em>“CryptoIntelX Data Deletion Request”</em> to{" "}
              <a
                href="mailto:noreplyauthentickit@gmail.com"
                className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
              >
                noreplyauthentickit@gmail.com
              </a>.
              Please include the email address associated with your CryptoIntelX account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              Data Retention Exceptions
            </h2>
            <p>
              Certain records, such as anonymized analytics or legally mandated audit logs,
              may be retained temporarily to comply with security obligations and regulatory
              frameworks. These datasets are stripped of identifiers and cannot be used to
              reconstruct personal information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              Third-Party Login Users
            </h2>
            <p>
              If you access CryptoIntelX via a third-party authentication provider (e.g.,
              Google, GitHub, Facebook, or MetaMask), you may also revoke CryptoIntelX’s
              access from your account’s app settings. This action prevents future data
              sharing between CryptoIntelX and the provider.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-sm sm:text-base text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
          This Data Deletion Policy forms part of the{" "}
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
          for CryptoIntelX.
        </footer>
      </div>
    </main>
  );
};

export default DataDeletion;
