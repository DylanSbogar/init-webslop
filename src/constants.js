// The shadcn CLI version both `init` and `add` are invoked with.
// Pinned deliberately: see docs/superpowers/specs/2026-10-03-init-webslop-design.md
// ("Version pinning"). Bump this to move to a newer shadcn + template.
export const SHADCN_VERSION = "4.21.1"

// Default shadcn preset (a custom preset code). Change to taste.
export const DEFAULT_PRESET = "bK05e04oq"

// Minimum Node, sourced from Vite 8's engines field.
export const MIN_NODE = "20.19.0"

export const TANSTACK_DEPS = [
  "@tanstack/react-query",
  "@tanstack/react-router",
  "@tanstack/react-table",
]

export const TANSTACK_DEV_DEPS = ["@tanstack/router-plugin"]
