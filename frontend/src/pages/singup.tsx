import { Auth } from "../components/auth"
import { Quote } from "../components/quote"
export const Signup = () => {
    return <div className="h-screen lg:grid lg:grid-cols-2 w-full">
        {/* //left part */}
        <Auth type="signup"></Auth>
        
        {/* Right part */}
        <Quote></Quote>
        
    </div>
}