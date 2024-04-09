"use client"
import { useState } from "react"
import Button from "./Button"
import { AnimatePresence, motion } from "framer-motion"

export default function Settings({
  children,
  open,
  setOpen,
}: {
  children: React.ReactNode
  open: boolean
  setOpen: (a: boolean) => void
}) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed bottom-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 100 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-opacity-75 backdrop-blur-sm transition-opacity"
            />
            <motion.dialog
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "-100%", opacity: 100 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "tween", duration: 0.15 }}
              open={open}
              className="fixed z-50 h-min w-full rounded-t-lg border bg-white p-8 text-black lg:top-[50%] lg:w-1/2 lg:translate-x-[-50%] lg:translate-y-[-50%] lg:rounded-lg dark:bg-black dark:text-white"
            >
              {children}
              <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
                Close
              </Button>
            </motion.dialog>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
