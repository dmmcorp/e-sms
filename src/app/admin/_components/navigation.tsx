import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "./variants";
import { cn } from "@/lib/utils";

function Navigation() {
  return (
    <div className="">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-y-10"
      >
        <Link
          href={`/admin/user`}
          className={cn(
            " text-white text-xl md:text-4xl tracking-widest font-extrabold "
          )}
        >
          <motion.h1
            whileHover={{ scale: 1.06 }}
            variants={itemVariants}
            className="hover:underline uppercase"
          >
            User
          </motion.h1>
        </Link>
        <Link
          href={`/admin/data`}
          className={cn(
            " text-white text-xl md:text-4xl tracking-widest font-extrabold "
          )}
        >
          <motion.h1
            whileHover={{ scale: 1.06 }}
            variants={itemVariants}
            className="hover:underline uppercase"
          >
            Data
          </motion.h1>
        </Link>
        <Link
          href={`/admin/backup`}
          className="text-white text-xl md:text-4xl tracking-widest font-extrabold "
        >
          <motion.h1
            whileHover={{ scale: 1.06 }}
            variants={itemVariants}
            className="hover:underline uppercase"
          >
            BackUp
          </motion.h1>
        </Link>
        <Link
          href={`/admin/system-settings`}
          className="text-white text-xl md:text-4xl tracking-widest font-extrabold "
        >
          <motion.h1
            whileHover={{ scale: 1.06 }}
            variants={itemVariants}
            className="hover:underline uppercase"
          >
            System Settings
          </motion.h1>
        </Link>
        <Link
          href={`/admin/about`}
          className="text-white text-xl md:text-4xl tracking-widest font-extrabold "
        >
          <motion.h1
            whileHover={{ scale: 1.06 }}
            variants={itemVariants}
            className="hover:underline uppercase"
          >
            About
          </motion.h1>
        </Link>
      </motion.div>
    </div>
  );
}

export default Navigation;
