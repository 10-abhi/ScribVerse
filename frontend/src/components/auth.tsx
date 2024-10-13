import { ChangeEvent, useState } from "react"
import { SignupType } from "@10-abhi/zodvalidator"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export const Auth = ({type} : {type : "singup" | "singin"})=>{
        
        const [postInputs , setPostInputs] = useState<SignupType>({
            email : "",
            password : "" ,
            name : ""
        })

        const navigate = useNavigate();

       async function SendRequest(){
            const response =  await axios.post(`https://backend.abhigdscnew.workers.dev/api/vi/${type ==="singup" ? "signup" : "signin"}` ,
                postInputs );
                const jwt = response.data;
                localStorage.setItem("token" , jwt);
                navigate("/blogs");

        }
    return <div className=" flex flex-col bg-gradient-to-tl from-sky-800 via-slate-800 to-cyan-900 min-h-full w-full justify-center items-center">
            {/* //heading */}
            <div className="flex flex-col gap-2 mb-2">
                <div className="text-slate-50 text-4xl font-bold flex justify-center">Create an Account</div>
                <div className="flex text-slate-200 justify-center text-2xl font-semibold">Already have an account</div>
            </div>
            {/* body */}
            <div className="flex flex-col text-slate-300 gap-2 text-xl font-sans">
                 <InputBox label="email" placeholder="xyz@gmai.com" onChange={e=>{
                   setPostInputs({
                    ...postInputs ,
                    email : e.target.value
                   })
                 }}></InputBox>
                 <InputBox label="password" type="password" placeholder="pass1245" onChange={e=>{
                   setPostInputs({
                    ...postInputs ,
                    password : e.target.value
                   })
                 }}></InputBox>
                 {type === "singup" ? <InputBox label="name" placeholder="Your Name" onChange={e=>{
                   setPostInputs({
                    ...postInputs ,
                    name : e.target.value
                   })
                 }}></InputBox> : null}
                <button onClick={SendRequest} className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md group-hover:bg-opacity-0">
                        SingUp
                    </span>
                </button>
            </div>

        </div>
}

interface InputBoxType {
    label : string ,
    placeholder : string ,
    onChange : (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string
}
function InputBox({label , placeholder , onChange , type} : InputBoxType){
    return <div>
     <label className="block mb-2 text-sm text-black font-semibold pt-4">{label}</label>
     <input type={type|| "text"} placeholder={placeholder} onChange={onChange} className="rounded-md border-emerald-700 border-2"/>
    </div>
}