import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants, type Button } from "@/components/ui/button"

/**
 * Renders a centered navigation container for pagination controls.
 *
 * The element includes role="navigation", aria-label="pagination", and data-slot="pagination".
 *
 * @returns A <nav> element prepared for pagination layout and accessibility
 */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

/**
 * Renders the inner list container for pagination items.
 *
 * @returns The `<ul>` element used as the pagination content container with layout classes and a `data-slot="pagination-content"` attribute.
 */
function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

/**
 * Renders a list item wrapper for a pagination control.
 *
 * @returns A `<li>` element with `data-slot="pagination-item"` and any forwarded props
 */
function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

/**
 * Render a styled pagination anchor that reflects an active/current state.
 *
 * When `isActive` is true the element receives `aria-current="page"`, an active
 * data attribute, and the outline button variant; otherwise it uses the ghost variant.
 *
 * @param isActive - Whether this link represents the current page; applies active styling and `aria-current` when true
 * @param size - Button size variant to apply; defaults to `"icon"`
 * @returns A JSX `a` element configured as a pagination link with appropriate accessibility and styling attributes
 */
function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a pagination control for navigating to the previous page.
 *
 * Renders an interactive previous-page link containing a left chevron icon and an accessible label.
 *
 * @returns The React element for the previous-page pagination control.
 */
function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      {/*<span className="hidden sm:block">Previous</span>*/}
    </PaginationLink>
  )
}

/**
 * Renders the "next page" pagination control.
 *
 * @param className - Additional CSS classes merged with the component's default classes
 * @param props - All other props are forwarded to the underlying PaginationLink
 * @returns A PaginationLink element configured as the next-page control (includes right chevron icon and an accessible label)
 */
function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      {/*<span className="hidden sm:block">Next</span>*/}
      <ChevronRightIcon />
    </PaginationLink>
  )
}

/**
 * Renders a non-interactive ellipsis indicator used to show truncated pagination.
 *
 * @returns A span element containing a horizontal-more icon and a screen-reader-only label "More pages"
 */
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}