#!/usr/bin/env python3
"""Check a frontend tree for static signals of the Sarvam public web system."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


EXTENSIONS = {
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".html",
    ".htm",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".vue",
    ".svelte",
    ".astro",
}
SKIP_DIRS = {
    ".git",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".astro",
    "node_modules",
    "dist",
    "build",
    "coverage",
}
GENERIC_FONT_FAMILIES = {
    "cursive",
    "fantasy",
    "monospace",
    "sans-serif",
    "serif",
    "system-ui",
    "ui-monospace",
    "ui-rounded",
    "ui-sans-serif",
    "ui-serif",
}


def source_text(root: Path) -> tuple[str, int]:
    if root.is_file():
        return root.read_text(encoding="utf-8", errors="ignore"), 1

    chunks: list[str] = []
    count = 0
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        chunks.append(path.read_text(encoding="utf-8", errors="ignore"))
        count += 1
    return "\n".join(chunks), count


def has_any(text: str, patterns: list[str]) -> bool:
    return any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in patterns)


def has_explicit_font_role(text: str, role: str) -> bool:
    declarations = re.findall(
        rf"--(?:[\w-]+-)?font-(?:role-)?{role}\s*:\s*([^;{{}}]+);",
        text,
        flags=re.IGNORECASE,
    )
    for declaration in declarations:
        value = declaration.strip()
        primary_family = value.split(",", 1)[0].strip().strip("\"'").lower()
        if "var(" in value or (
            re.search(r"[a-z]", value, flags=re.IGNORECASE)
            and primary_family not in GENERIC_FONT_FAMILIES
            and primary_family
            not in {"inherit", "initial", "revert", "revert-layer", "unset"}
        ):
            return True
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("target", type=Path)
    parser.add_argument("--json", action="store_true")
    parser.add_argument(
        "--mode",
        choices=("official", "aligned"),
        default="aligned",
        help="Official mode requires exact Sarvam font-family signals.",
    )
    args = parser.parse_args()

    if not args.target.exists():
        parser.error(f"target does not exist: {args.target}")

    text, files = source_text(args.target)
    checks = {
        "font_display_season_mix": has_any(
            text,
            [
                r"font-family\s*:\s*[\"']?Season Mix\b",
                r"--font-season-mix\s*:\s*[\"']?Season Mix\b",
                r"SeasonMixVFUprights",
            ],
        ),
        "font_body_matter": has_any(
            text,
            [
                r"font-family\s*:\s*[\"']?Matter(?:[\"'],;]|\s*$)",
                r"--font-matter\s*:\s*[\"']?Matter(?:[\"'],;])",
                r"MatterUprights",
            ],
        ),
        "font_metadata_matter_mono": has_any(
            text,
            [
                r"font-family\s*:\s*[\"']?Matter Semi Mono\b",
                r"--font-matter-mono\s*:\s*[\"']?Matter Semi Mono\b",
                r"MatterSemiMonoRegular",
            ],
        ),
        "font_role_display": has_explicit_font_role(text, "display"),
        "font_role_body": has_explicit_font_role(text, "body"),
        "font_role_metadata": has_explicit_font_role(text, "metadata"),
        "core_canvas": has_any(text, [r"#fafafa", r"rgb\(\s*250\s*,\s*250\s*,\s*250"]),
        "core_text": has_any(text, [r"#1f1f1f", r"rgb\(\s*31\s*,\s*31\s*,\s*31"]),
        "brand_indigo": has_any(text, [r"#3333cc", r"#33c\b", r"51\s*,\s*51\s*,\s*204"]),
        "brand_orange": has_any(text, [r"#e6651b", r"230\s*,\s*101\s*,\s*27"]),
        "pill_geometry": has_any(
            text,
            [
                r"border-radius\s*:\s*9999",
                r"rounded-full",
                r"border-radius:\s*50%",
                r"--[\w-]*radius-pill\s*:\s*9999px",
            ],
        ),
        "touch_target": has_any(
            text,
            [
                r"min-height\s*:\s*44px",
                r"min-h-\[44px\]",
                r"h-11\b",
                r"--[\w-]*touch-target\s*:\s*44px",
            ],
        ),
        "mobile_breakpoint": has_any(
            text, [r"min-width\s*:\s*(48rem|768px)", r"\bmd:"]
        ),
        "desktop_nav_breakpoint": has_any(
            text, [r"min-width\s*:\s*(64rem|1024px)", r"\blg:"]
        ),
        "focus_visible": has_any(text, [r":focus-visible", r"focus-visible:"]),
        "reduced_motion": has_any(text, [r"prefers-reduced-motion"]),
        "primary_gradient": has_any(
            text,
            [
                r"#3a3f5c[\s\S]{0,160}#1e2033",
                r"58\s*,\s*63\s*,\s*92[\s\S]{0,160}30\s*,\s*32\s*,\s*51",
            ],
        ),
    }

    font_checks = {
        "font_display_season_mix",
        "font_body_matter",
        "font_metadata_matter_mono",
    }
    font_role_checks = {
        "font_role_display",
        "font_role_body",
        "font_role_metadata",
    }
    required_checks = set(checks)
    if args.mode == "aligned":
        required_checks -= font_checks
    else:
        required_checks -= font_role_checks
    required_misses = sorted(name for name in required_checks if not checks[name])
    optional_misses = sorted(
        name for name in checks if name not in required_checks and not checks[name]
    )
    passed = sum(checks.values())
    result = {
        "target": str(args.target.resolve()),
        "mode": args.mode,
        "files_scanned": files,
        "checks_passed": passed,
        "checks_total": len(checks),
        "required_checks": len(required_checks),
        "required_misses": required_misses,
        "optional_misses": optional_misses,
        "checks": checks,
        "warning": (
            "Static signals do not prove visual fidelity, authorization, "
            "responsive behavior, or accessibility."
        ),
    }

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Scanned {files} source files in {args.mode} mode.")
        for name, ok in checks.items():
            if ok:
                status = "PASS"
            elif name in required_checks:
                status = "MISS-REQUIRED"
            else:
                status = "MISS-OPTIONAL"
            print(f"[{status}] {name}")
        print(f"Static signal total: {passed}/{len(checks)}")
        print(result["warning"])

    return 0 if not required_misses else 1


if __name__ == "__main__":
    sys.exit(main())
