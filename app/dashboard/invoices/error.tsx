'use client';

import { useEffect } from "react";

export default function Error({
    error,
    reset
} : { 
    error: Error & {digest?: string} ,
    reset: ()=>void
}){
    useEffect(()=>{
        console.log(error);
    },[error])
    return(
        <main className="flex h-full flex-col justify-center items-center">
            <h2 className="text-center">Something went wrong</h2>
            <button 
                className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-300"
                onClick={()=>reset()}
            >
                Try again
            </button>
        </main>

    )
} 