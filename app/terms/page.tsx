export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-stone-700">
          <section>
            <h2 className="text-xl font-bold mb-2">Last Updated: {new Date().toLocaleDateString()}</h2>
            <p className="leading-relaxed">
              By using Apple of the Infinite Abyss ("the Application"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing or using the Application, you acknowledge that you have read, understood, and agree to be bound by these Terms. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Age Requirement</h2>
            <p className="text-sm leading-relaxed">
              You must be at least 13 years old to use this Application. By using the Application, you represent and warrant that you are at least 13 years old.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. License to Use</h2>
            <p className="text-sm leading-relaxed">
              We grant you a personal, non-exclusive, non-transferable license to use the Application for your personal, non-commercial purposes. You may not reproduce, distribute, or create derivative works of the Application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. User Conduct</h2>
            <p className="text-sm leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use the Application for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to the Application or its related systems</li>
              <li>Interfere with or disrupt the Application or servers</li>
              <li>Use automated tools to access the Application</li>
              <li>Reverse engineer or attempt to extract the source code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Game Progress and Data</h2>
            <p className="text-sm leading-relaxed">
              Game progress is stored locally on your device using browser localStorage. We are not responsible for any loss of data due to browser cache clearing, device failure, or other circumstances. You are responsible for backing up your game progress using the export save feature.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Intellectual Property</h2>
            <p className="text-sm leading-relaxed mb-2">
              The Application and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Copy, modify, or distribute any content from the Application</li>
              <li>Use any trademarks, logos, or service marks without prior written consent</li>
              <li>Remove or alter any proprietary rights notices from the Application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Advertisements</h2>
            <p className="text-sm leading-relaxed mb-2">
              The Application may include advertisements from third parties such as Google AdSense and Adsterra. These advertisements are necessary to support the continued development and maintenance of the Application.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>You acknowledge that all advertisements are the responsibility of the third party providing them</li>
              <li>We do not endorse or guarantee the quality of any advertised products or services</li>
              <li>Clicking on advertisements may redirect you to third-party websites</li>
              <li>We are not responsible for the content or privacy practices of third-party websites</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Disclaimers</h2>
            <p className="text-sm leading-relaxed mb-2">
              THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>We make no warranties about the accuracy, reliability, or completeness of the Application</li>
              <li>We do not guarantee that the Application will be uninterrupted, timely, secure, or error-free</li>
              <li>Any material downloaded or obtained through the Application is at your own risk</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Indemnification</h2>
            <p className="text-sm leading-relaxed">
              You agree to indemnify and hold us harmless from any claims arising from your use of the Application, including but not limited to any third-party claims regarding intellectual property infringement or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Termination</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to terminate or suspend your access to the Application at any time, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">12. Changes to Terms</h2>
            <p className="text-sm leading-relaxed">
              We may revise these Terms at any time. The revised Terms will be effective immediately upon posting. Your continued use of the Application after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">13. Governing Law</h2>
            <p className="text-sm leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Brazil, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">14. Contact Information</h2>
            <p className="text-sm leading-relaxed mb-2">
              If you have any questions about these Terms, please contact us:
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
