import { SocialIcon } from "react-social-icons";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-background text-foreground py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Skribo.ai
            </div>
            <p className="text-muted-foreground mb-4 sm:mb-6 max-w-sm text-sm sm:text-base">
              AI-powered transcription for creators. Turn audio into text in
              minutes.
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center sm:justify-start">
              <SocialIcon
                url="https://twitter.com"
                className="h-5 w-5 sm:h-6 sm:w-6 opacity-60 hover:opacity-100 transition-opacity"
                bgColor="transparent"
                fgColor="currentColor"
              />
              <SocialIcon
                url="https://linkedin.com"
                className="h-5 w-5 sm:h-6 sm:w-6 opacity-60 hover:opacity-100 transition-opacity"
                bgColor="transparent"
                fgColor="currentColor"
              />
              <SocialIcon
                url="https://github.com"
                className="h-5 w-5 sm:h-6 sm:w-6 opacity-60 hover:opacity-100 transition-opacity"
                bgColor="transparent"
                fgColor="currentColor"
              />
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">
              Legal
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-muted-foreground text-sm sm:text-base">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 text-center text-muted-foreground">
          <p className="text-sm sm:text-base">
            &copy; 2025 Skribo.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
