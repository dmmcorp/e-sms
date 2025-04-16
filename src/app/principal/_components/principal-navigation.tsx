"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  containerVariants,
  itemVariants,
} from "@/app/admin/_components/variants";

export function PrincipalNavigation() {
  return (
    <div className="">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-y-10"
      >
        <Link
          href={`/principal/view-teachers`}
          className={cn(
            " text-white text-xl md:text-4xl tracking-widest font-extrabold "
          )}
        >
          <motion.h1
            whileHover={{ scale: 1.06 }}
            variants={itemVariants}
            className="hover:underline uppercase"
          >
            TEACHERS
          </motion.h1>
        </Link>
        <Link
          href={`/principal/view-students`}
          className={cn(
            " text-white text-xl md:text-4xl tracking-widest font-extrabold "
          )}
        >
          <motion.h1
            whileHover={{ scale: 1.06 }}
            variants={itemVariants}
            className="hover:underline uppercase"
          >
            Students
          </motion.h1>
        </Link>
        <Link
          href={`/principal/view-dashboard`}
          className="text-white text-xl md:text-4xl tracking-widest font-extrabold "
        >
          <motion.h1
            whileHover={{ scale: 1.06 }}
            variants={itemVariants}
            className="hover:underline uppercase"
          >
            Dashboard
          </motion.h1>
        </Link>
        <Link
          href={`/principal/about`}
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
