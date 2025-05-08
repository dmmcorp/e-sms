"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/features/current/api/use-current-user";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Image from "next/image";
import { BiLogOut } from "react-icons/bi";
import { api } from "../../convex/_generated/api";
import { usePathname } from "next/navigation";
import { cn, roleFormatter } from "@/lib/utils";
import Link from "next/link";

function MainNav() {
  const { user, isLoading } = useCurrentUser();
  const { signOut } = useAuthActions();
  const school = useQuery(api.systemSettings.get);
  const pathName = usePathname();

  if (isLoading) {
    return null;
  }

  return (
    <nav
      className={cn(
        pathName === "/admin" || pathName === "/teacher" ? "hidden" : "flex",
        "px-3 md:px-10 w-full h-18 z-50 shadow-md py-5 justify-between items-center pr-3 sm:pr-5 md:pr-10 lg:pr-10"
      )}
      style={{
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
      }}
    >
      <Link
        href={
          user?.role === "admin"
            ? "/admin"
            : user?.role === "principal"
              ? "/principal"
              : user?.role === "registrar"
                ? "/registrar"
                : "/teacher"
        }
        className="flex items-center gap-x-1 px-3 md:w-[20%] "
      >
        {school?.schoolImage ? (
          <Image
            src={school?.schoolImage as string}
            alt={school?.schoolName as string}
            className="w-16 h-16 object-contain"
            width={120}
            height={120}
          />
        ) : (
          <h1>School Logo</h1>
        )}
        <h1
          className="hidden md:block text-textWhite text-bold text-center md:text-sm uppercase font-medium leading-relaxed"
          style={{ color: "hsl(var(--primary-foreground))" }}
        >
          {school?.schoolName}
        </h1>
      </Link>

      <div className="flex items-center gap-x-5">
        <div className="flex items-center gap-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-x-3">
                <Avatar>
                  <AvatarFallback className="bg-sky-500 text-white">
                    {user?.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center hidden md:block">
                  <h3 className="text-sm capitalize">{user?.fullName}</h3>
                  <h6 className="text-xs text-left text-white/70">
                    {user?.role ? roleFormatter(user.role) : ""}
                  </h6>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="cursor-pointer"
              >
                <BiLogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

export default MainNav;
