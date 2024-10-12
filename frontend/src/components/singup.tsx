
export const Signup = () => {
    return <div className="h-screen flex lg:grid lg:grid-cols-2 w-full">
        {/* //left part */}
        <div className=" flex flex-col bg-gradient-to-tl from-sky-800 via-slate-800 to-cyan-900 min-h-screen w-full justify-center items-center">
            {/* //heading */}
            <div className="flex flex-col gap-2 mb-2">
                <div className="text-slate-50 text-4xl font-bold flex justify-center">Create an Account</div>
                <div className="flex text-slate-200 justify-center text-2xl font-semibold">Already have an account</div>
            </div>
            {/* body */}
            <div className="flex flex-col text-slate-300 gap-2 text-xl font-sans">
                <div className="">Username</div>
                <input className="rounded-md border-emerald-700 border-2" type="text" placeholder="Enter your name" />
                <div>Email</div>
                <input className="rounded-md border-emerald-700 border-2" type="text" placeholder="xyz@gmail.com" />
                <div>Password</div>
                <input className="rounded-md border-emerald-700 border-2" type="text" placeholder="this is my pass" />
                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md group-hover:bg-opacity-0">
                        Submit
                    </span>
                </button>
            </div>

        </div>
        {/* Right part */}
        <div className="bg-white lg:h-full w-0 lg:w-full invisible lg:visible ">
            <div className="flex h-full justify-center items-center bg-slate-800 lg:w-full ">
                <div className="flex flex-col justify-center items-center h-full text-slate-100 gap-2">
                    <div className="flex text-4xl font-extrabold">ScibVerse</div>
                    <div className="flex font-bold">The Scrib Uploading platform</div>
                    <div className="flex font-semibold"> Start Your Scibbing journey now </div>
                </div>

            </div>
        </div>
    </div>
}