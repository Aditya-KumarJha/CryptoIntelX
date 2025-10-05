"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

const Terms = () => {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-white-50 text-gray-800 dark:bg-black dark:text-gray-100 transition-colors duration-300">
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

      <div className="px-10 sm:px-15 py-10 sm:py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight underline decoration-black dark:decoration-white">
          CryptoIntelX – Terms of Service
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8">
          Last updated: 2025-08-28
        </p>

        <section className="space-y-8 leading-relaxed text-base sm:text-lg">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              1. Agreement
            </h2>
            <p>
              By accessing or using <strong>CryptoIntelX</strong>, you agree to abide by these Terms of Service. 
              CryptoIntelX provides tools and analytics for cryptocurrency intelligence, 
              blockchain address categorization, and public data aggregation. 
              If you disagree with any part of these Terms, you must discontinue using our services immediately.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              2. Accounts
            </h2>
            <p>
              To access certain features, you must create an account using a valid email address or social login. 
              You are responsible for maintaining the confidentiality of your credentials and any activity under your account. 
              CryptoIntelX is not liable for losses due to unauthorized account use resulting from your negligence.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              3. Acceptable Use
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use CryptoIntelX only for lawful, ethical, and research purposes.</li>
              <li>Do not scrape, copy, or redistribute CryptoIntelX data for commercial gain without permission.</li>
              <li>Do not use the platform to track or target individuals or commit illegal activities.</li>
              <li>Do not upload or share malicious code, spam, or conduct denial-of-service attacks.</li>
              <li>Respect all applicable cybersecurity, data protection, and anti-money-laundering laws.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              4. Data and Intellectual Property
            </h2>
            <p>
              All datasets, code, AI models, visualizations, and materials provided via CryptoIntelX 
              are protected by intellectual property laws. You may view or analyze the data for educational, 
              ethical research, or compliance-related purposes. Any reproduction or redistribution 
              requires prior written consent from CryptoIntelX.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              5. Privacy and Data Usage
            </h2>
            <p>
              Your personal information is handled as described in our{" "}
              <a href="/privacy" className="text-blue-600 dark:text-blue-400 underline hover:opacity-80">
                Privacy Policy
              </a>. We collect minimal user data necessary to operate the service and comply with applicable law.
              You retain rights over your account data and may request deletion at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              6. Service Availability
            </h2>
            <p>
              CryptoIntelX aims for continuous uptime and reliability, but we do not guarantee 
              uninterrupted access. We may modify, suspend, or discontinue features 
              temporarily or permanently without prior notice for maintenance, upgrades, or security reasons.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              7. Limitation of Liability
            </h2>
            <p>
              CryptoIntelX is provided “as is” without warranties of any kind. We are not responsible 
              for any indirect, incidental, or consequential damages arising from use of our platform, 
              including but not limited to financial loss, reputational harm, or misuse of intelligence data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              8. Compliance and Legal Use
            </h2>
            <p>
              Users must comply with all applicable laws and regulations related to cryptocurrency 
              intelligence, privacy, and cybersecurity. CryptoIntelX strictly prohibits usage 
              for surveillance of private individuals or illegal investigation purposes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              9. Modifications
            </h2>
            <p>
              We may update these Terms periodically to reflect product improvements or regulatory updates. 
              The latest version will always be available on this page, and continued use implies acceptance 
              of any revisions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              10. Contact
            </h2>
            <p>
              For legal, compliance, or general inquiries regarding these Terms, please reach out at{" "}
              <a
                href="mailto:noreplyauthentickit@gmail.com"
                className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
              >
                noreplyauthentickit@gmail.com
              </a>.
            </p>
          </div>
        </section>

        <footer className="mt-12 text-sm sm:text-base text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
          This document is for informational purposes only and does not constitute legal advice.
        </footer>
      </div>
    </main>
  );
};

export default Terms;
