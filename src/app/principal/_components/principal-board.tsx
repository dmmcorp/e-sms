"use client";
import { useQuery } from "convex/react";
import { PrincipalNavigation } from "./principal-navigation";
import { api } from "../../../../convex/_generated/api";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";

export function PrincipalBoard() {
  const school = useQuery(api.systemSettings.get);

  return (
    <div className="h-screen w-full lg:flex lg:flex-row">
      <div className="h-full w-full lg:w-[50%] flex flex-col flex-1 items-center justify-center bg-primary">
        <div className="h-full flex items-center justify-center ">
          <div className="md:h-auto md:w-[420px]">
            <PrincipalNavigation />
          </div>
        </div>
      </div>

      {school === undefined ? (
        <div className="w-full h-full lg:w-[50%] lg:flex lg:flex-col lg:justify-center lg:items-center">
          <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
          <p className="text-primary mt-4">Loading school information...</p>
        </div>
      ) : school ? (
        <>
          <div className="hidden lg:w-[50%] bg-zinc-50 lg:flex lg:flex-col lg:justify-center lg:items-center text-white px-[76px]">
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Image
                src={school.schoolImage as string}
                alt={school.schoolName as string}
                width={240}
                height={240}
                className="mb-6"
              />

              <h1 className="text-3xl font-bold leading-tight text-black">
                {school.schoolName}
              </h1>
            </div>

            <div className="text-lg font-medium flex flex-col justify-center items-center mt-auto mb-[60px] text-black">
              <h1>ERMS.</h1>
              <h1>Electronic Records Management System</h1>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="hidden lg:w-[50%] bg-zinc-50 lg:flex lg:flex-col lg:justify-center lg:items-center text-white px-[76px]">
            <div className="text-lg font-medium flex flex-col justify-center items-center mt-auto mb-[60px] text-black">
              <h1>ERMS.</h1>
              <h1>Electronic Records Management System</h1>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
