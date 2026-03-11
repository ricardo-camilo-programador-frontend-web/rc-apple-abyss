export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-stone-700">
          <section>
            <h2 className="text-xl font-bold mb-2">Last Updated: {new Date().toLocaleDateString()}</h2>
            <p className="leading-relaxed">
              Apple of the Infinite Abyss ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Game Progress Data</h3>
                <p className="text-sm leading-relaxed">
                  We store your game progress locally in your browser using localStorage. This data includes gold amount, upgrades purchased, stages achieved, and other gameplay statistics. We do not transmit this data to any external servers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Analytics Data</h3>
                <p className="text-sm leading-relaxed">
                  We use third-party analytics services (Microsoft Clarity) to collect anonymous usage data such as page views, click patterns, and device information. This helps us improve the user experience and fix bugs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Advertising Data</h3>
                <p className="text-sm leading-relaxed">
                  We use Google AdSense and Adsterra to display advertisements. These services may collect information about your browsing behavior, IP address, and device type to serve relevant ads.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>To provide and maintain the game experience</li>
              <li>To analyze usage patterns and improve the application</li>
              <li>To display relevant advertisements</li>
              <li>To detect and prevent technical issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Cookies and Local Storage</h2>
            <p className="text-sm leading-relaxed mb-2">
              We use cookies and localStorage for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Essential: Required for the game to function (game progress, settings)</li>
              <li>Analytics: To understand how users interact with the application</li>
              <li>Advertising: To serve personalized ads and measure ad performance</li>
            </ul>
            <p className="text-sm leading-relaxed mt-2">
              You can control cookies through your browser settings. Note that disabling cookies may affect game functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Third-Party Services</h2>
            <p className="text-sm leading-relaxed mb-2">We integrate with the following third-party services:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Google AdSense:</strong> Displays advertisements</li>
              <li><strong>Adsterra:</strong> Displays advertisements</li>
              <li><strong>Microsoft Clarity:</strong> User analytics and heatmaps</li>
              <li><strong>Counter.dev:</strong> Visitor statistics</li>
            </ul>
            <p className="text-sm leading-relaxed mt-2">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Data Security</h2>
            <p className="text-sm leading-relaxed">
              We implement appropriate security measures to protect your data. Game progress data is stored locally on your device and is not transmitted to our servers. We do not collect personal information such as names, emails, or addresses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Children's Privacy</h2>
            <p className="text-sm leading-relaxed">
              Our application is designed for general audiences. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Your Rights</h2>
            <p className="text-sm leading-relaxed mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Access and delete your game progress data (via browser localStorage)</li>
              <li>Opt out of personalized advertising</li>
              <li>Disable cookies through browser settings</li>
              <li>Request information about our data practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. Your continued use of the application after changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have questions about this Privacy Policy, please contact us through GitHub:
            </p>
            <a 
              href="https://github.com/ricardo-camilo-programador-frontend-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              https://github.com/ricardo-camilo-programador-frontend-web
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
