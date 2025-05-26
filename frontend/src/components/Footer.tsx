import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"
import AnimatedContainer from "./AnimatedContainer"
import { useApp } from "../context/AppContext"

const Footer = () => {
  const { isAppReady, isPageLoading } = useApp()

  // not rendering footer until app is ready and page is not loading
  if (!isAppReady || isPageLoading) {
    return null
  }

  return (
    <footer className="bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800/50 relative z-10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fade-up" className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-fuchsia-500" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-sky-500 animated-gradient-text">
                ScribVerse
              </span>
            </div>
            <p className="mt-4 text-base text-zinc-400">
              ScribVerse is a platform for writers to share their thoughts, stories, and ideas with the world. Join our
              community of creative minds.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="#" className="text-base text-zinc-400 hover:text-fuchsia-300 transition-colors">
                  Writing Guides
                </Link>
              </li>
              <li>
                <Link to="#" className="text-base text-zinc-400 hover:text-fuchsia-300 transition-colors">
                  Content Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-base text-zinc-400 hover:text-fuchsia-300 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="#" className="text-base text-zinc-400 hover:text-fuchsia-300 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="#" className="text-base text-zinc-400 hover:text-fuchsia-300 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-base text-zinc-400 hover:text-fuchsia-300 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="#" className="text-base text-zinc-400 hover:text-fuchsia-300 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </AnimatedContainer>
        <div className="mt-8 border-t border-zinc-800 pt-8">
          <p className="text-base text-zinc-400 text-center">
            &copy; {new Date().getFullYear()} ScribVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
