import { FaceFrownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function NotFound() {
    return(
        <main className="flex flex-col justify-center items-center gap-2 h-full">
            <FaceFrownIcon className="w-10 text-gray-400"/>
            <h2 className="text-xl font-bold">404 Not Found</h2>
            <p>Could not find the requested invoice</p>
            <Link 
                href="/dashboard/invoices"
                className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
            >
                Go Back
            </Link>
        </main>
    )
}