"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

const PrivacyPolicy = () => {
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
          CryptoIntelX – Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8">
          Last updated: 2025-08-28
        </p>

        <section className="space-y-8 leading-relaxed text-base sm:text-lg">
          <p>
            At <strong>CryptoIntelX</strong>, we take privacy seriously. Our mission is to
            enhance transparency and security in the crypto ecosystem without compromising
            individual privacy. This Privacy Policy explains how we collect, process, and
            safeguard personal information when you interact with our platform, APIs, or
            affiliated services.
          </p>

          {/* What We Collect */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email, authentication provider
                details (Google, GitHub, Facebook, or Wallet address), and verification
                metadata.
              </li>
              <li>
                <strong>Technical & Usage Data:</strong> IP address, browser type, device
                fingerprint, access times, API request logs, and cookies for analytics or
                authentication.
              </li>
              <li>
                <strong>Blockchain Interaction Data:</strong> Non-custodial wallet addresses,
                public transaction hashes, and interaction metadata (never private keys).
              </li>
              <li>
                <strong>Communications:</strong> Support messages, feedback, and issue reports
                you submit to us.
              </li>
            </ul>
          </div>

          {/* How We Use */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authenticate users and manage secure account sessions.</li>
              <li>Enable blockchain intelligence tools and data visualizations.</li>
              <li>Enhance product features, threat detection, and performance analytics.</li>
              <li>Comply with security investigations and fraud prevention mechanisms.</li>
              <li>Respond to legal obligations or government compliance requests.</li>
            </ul>
          </div>

          {/* Legal Basis */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              3. Legal Basis for Processing
            </h2>
            <p>
              We process your personal data based on legitimate interests (such as maintaining
              platform integrity and security), your consent (for analytics or marketing), or
              legal obligations related to anti-fraud, KYC, or compliance requirements.
            </p>
          </div>

          {/* Data Retention */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              4. Data Retention
            </h2>
            <p>
              We retain data only as long as necessary for operational and regulatory purposes.
              Aggregated or anonymized datasets may be stored longer for statistical and
              security trend analysis. You may request deletion anytime via our{" "}
              <a
                href="/data-deletion"
                className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
              >
                Data Deletion
              </a>{" "}
              policy.
            </p>
          </div>

          {/* Rights */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              5. Your Rights
            </h2>
            <p>
              You have the right to access, update, delete, or restrict processing of your
              personal data. You can also export a machine-readable copy of your data or
              withdraw consent at any time by contacting{" "}
              <a
                href="mailto:noreplyauthentickit@gmail.com"
                className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
              >
                noreplyauthentickit@gmail.com
              </a>
              .
            </p>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              6. Data Security
            </h2>
            <p>
              We use encryption, secure access tokens, audit logging, and network monitoring
              to protect user data. Sensitive actions are verified using multi-factor
              authentication (MFA) and blockchain integrity checks. However, no online
              platform can guarantee absolute security.
            </p>
          </div>

          {/* Third-Party */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              7. Third-Party Integrations
            </h2>
            <p>
              CryptoIntelX integrates with authentication and analytics providers such as
              Google, GitHub, Facebook, and MetaMask. Data shared with these platforms is
              governed by their respective privacy policies. We do not sell or trade user data.
            </p>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              8. Cookies and Tracking
            </h2>
            <p>
              We use cookies to maintain login sessions, personalize dashboards, and analyze
              anonymized traffic. You can disable cookies in your browser settings, but this
              may limit functionality. For more details, refer to our{" "}
              <a
                href="/cookies"
                className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
              >
                Cookie Policy
              </a>
              .
            </p>
          </div>

          {/* International */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              9. International Data Transfers
            </h2>
            <p>
              Your data may be processed in regions where CryptoIntelX or its partners operate,
              following international standards like GDPR and ISO 27001-compliant frameworks.
              We ensure adequate protection measures are in place for cross-border transfers.
            </p>
          </div>

          {/* Children */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              10. Children’s Privacy
            </h2>
            <p>
              CryptoIntelX is not intended for individuals under 16. We do not knowingly
              collect personal information from minors. If such data is found, it will be
              deleted immediately.
            </p>
          </div>

          {/* Changes */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              11. Updates to This Policy
            </h2>
            <p>
              We may update this policy periodically to reflect legal, operational, or
              technical changes. The latest version will always be available on this page.
              Continued use of our services after updates implies your acceptance.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 underline decoration-black dark:decoration-white">
              12. Contact Us
            </h2>
            <p>
              For privacy-related questions or data requests, contact our compliance team at{" "}
              <a
                href="mailto:noreplyauthentickit@gmail.com"
                className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
              >
                noreplyauthentickit@gmail.com
              </a>
              .
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-sm sm:text-base text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
          This Privacy Policy is part of CryptoIntelX’s{" "}
          <a
            href="/terms"
            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/data-deletion"
            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
          >
            Data Deletion Policy
          </a>
          . For additional details, refer to our compliance documentation.
        </footer>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
