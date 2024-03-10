"use client";
import { Board, Position, useBoard } from "@/hooks/useBoard";
import { motion, AnimatePresence } from "framer-motion";
import { Fragment, useState } from "react";

export default function Game() {
  const [animating, setAnimating] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState<Position | undefined>(
    undefined,
  );
  const [tiles, setTiles] = useState(
    Array.from({ length: 8 }, (_, i) =>
      Array.from({ length: 8 }, (_, j) => i * 8 + j),
    ),
  );

  function clickTile(position: Position) {
    if (animating) {
      return;
    }
    if (!selectedFrom) {
      setSelectedFrom(position);
      return;
    }
    const temp = tiles[position.x][position.y];
    tiles[position.x][position.y] = tiles[selectedFrom.x][selectedFrom.y];
    tiles[selectedFrom.x][selectedFrom.y] = temp;

    setSelectedFrom(undefined);
  }
  return (
    <main className="grid w-fit grid-cols-8 grid-rows-8 items-center gap-8 p-24">
      <AnimatePresence>
        {tiles.map((row, x) =>
          row.map((tile, y) => (
            <motion.button
              layout="position"
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              key={tile}
              onClick={(_) => clickTile({ x, y })}
              className="flex size-12 items-center justify-center rounded bg-white text-black"
            >
              {tile}
            </motion.button>
          )),
        )}
      </AnimatePresence>
    </main>
  );
}
