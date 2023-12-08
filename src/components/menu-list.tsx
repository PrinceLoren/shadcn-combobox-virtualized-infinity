import { Children, FC, PropsWithChildren, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

import { CommandGroup } from "@/components/ui/command"

export const MenuList: FC<
  PropsWithChildren<{ loadMoreOptions?: VoidFunction }>
> = (props) => {
  const { children, loadMoreOptions } = props
  const parentRef = useRef<HTMLDivElement | null>(null)
  const childrenArray = Children.toArray(children)
  const rowVirtualizer = useVirtualizer({
    count: childrenArray.length ?? childrenArray.length + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 0,
  })

  const checkScrollPosition = () => {
    const scrollContainer = parentRef.current
    if (scrollContainer) {
      const isAtBottom =
        scrollContainer.scrollHeight - scrollContainer.scrollTop ===
        scrollContainer.clientHeight

      if (isAtBottom && loadMoreOptions) {
        loadMoreOptions()
      }
    }
  }

  return (
    <div
      ref={parentRef}
      style={{
        height: `200px`,
        width: `100%`,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        overflow: "auto",
        zIndex: 99999,
      }}
      className="no-scrollbar"
      onScroll={checkScrollPosition}
    >
      <CommandGroup
        style={{
          height: `${rowVirtualizer.getTotalSize() + 1}px`,
        }}
        className="relative w-full"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const value = childrenArray[virtualRow.index]
          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {value}
            </div>
          )
        })}
      </CommandGroup>
    </div>
  )
}
