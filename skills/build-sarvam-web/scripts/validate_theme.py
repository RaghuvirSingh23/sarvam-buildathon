#!/usr/bin/env python3
"""Validate a Sarvam theme CSS file against the bundled token snapshot."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parents[1]
DEFAULT_TOKENS = SKILL_DIR / "assets" / "sarvam-theme.tokens.json"

FONT_TOKEN_VARS = {
    "display": "--font-season-mix",
    "body": "--font-matter",
    "metadata": "--font-matter-mono",
    "code": "--font-code",
}
ACTIVE_FONT_VARS = {
    "display": "--sarvam-font-display",
    "body": "--sarvam-font-body",
    "metadata": "--sarvam-font-metadata",
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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--css",
        type=Path,
        required=True,
        help="Target app theme CSS to validate.",
    )
    parser.add_argument(
        "--mode",
        choices=("official", "aligned"),
        default="official",
        help=(
            "Official mode requires the recorded Sarvam font stacks and font-face "
            "ranges; aligned mode accepts explicit active substitute font roles."
        ),
    )
    parser.add_argument("--tokens", type=Path, default=DEFAULT_TOKENS)
    return parser.parse_args()


def normalize(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value).strip()).lower()


def main() -> int:
    args = parse_args()
    css = args.css.read_text(encoding="utf-8")
    tokens = json.loads(args.tokens.read_text(encoding="utf-8"))
    failures: list[str] = []

    css_vars = {
        name: normalize(value)
        for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;{}]+);", css)
    }

    def check_var(css_name: str, expected: Any) -> None:
        actual = css_vars.get(css_name)
        wanted = normalize(expected)
        if actual != wanted:
            failures.append(
                f"{css_name}: expected {expected}, found {actual or 'missing'}"
            )

    def resolve_var(css_name: str, trail: tuple[str, ...] = ()) -> str | None:
        if css_name in trail:
            failures.append(
                f"{css_name}: circular variable reference "
                f"({' -> '.join((*trail, css_name))})"
            )
            return None
        value = css_vars.get(css_name)
        if value is None:
            return None
        reference = re.fullmatch(r"var\(\s*(--[\w-]+)\s*\)", value)
        if reference:
            return resolve_var(reference.group(1), (*trail, css_name))
        return value

    for name, expected in tokens["colors"].items():
        check_var(name, expected)

    check_var(FONT_TOKEN_VARS["code"], tokens["fonts"]["code"])
    if args.mode == "official":
        for role in ("display", "body", "metadata"):
            check_var(FONT_TOKEN_VARS[role], tokens["fonts"][role])

    for role, css_name in ACTIVE_FONT_VARS.items():
        actual = resolve_var(css_name)
        if actual is None:
            failures.append(
                f"{css_name}: missing or unresolved active {role} font role"
            )
            continue
        primary_family = actual.split(",", 1)[0].strip().strip("\"'").lower()
        if (
            not re.search(r"[a-z]", actual, flags=re.IGNORECASE)
            or primary_family in GENERIC_FONT_FAMILIES
            or primary_family in {"inherit", "initial", "revert", "revert-layer", "unset"}
        ):
            failures.append(
                f"{css_name}: active {role} font role must start with an explicit "
                "named family or resolvable font variable"
            )
            continue
        if args.mode == "official":
            wanted = normalize(tokens["fonts"][role])
            if actual != wanted:
                failures.append(
                    f"{css_name}: official mode expected {tokens['fonts'][role]}, "
                    f"resolved to {actual}"
                )

    for name, value in tokens["weights"]["matter"].items():
        check_var(f"--matter-weight-{name}", value)
    for name, value in tokens["weights"]["seasonMix"].items():
        check_var(f"--season-mix-weight-{name}", value)

    layout_vars = {
        "spacingUnit": "--sarvam-space",
        "siteMax": "--sarvam-site-max",
        "contentMax": "--sarvam-content-max",
        "mobileSectionGap": "--sarvam-section-gap-mobile",
        "desktopSectionGap": "--sarvam-section-gap-desktop",
        "touchTargetMin": "--sarvam-touch-target",
    }
    for name, css_name in layout_vars.items():
        check_var(css_name, tokens["layout"][name])

    breakpoint_vars = {
        "sm": "--sarvam-breakpoint-sm",
        "md": "--sarvam-breakpoint-md",
        "lg": "--sarvam-breakpoint-lg",
        "xl": "--sarvam-breakpoint-xl",
        "2xl": "--sarvam-breakpoint-2xl",
    }
    for name, css_name in breakpoint_vars.items():
        check_var(css_name, tokens["breakpoints"][name])

    radius_vars = {
        "small": "--sarvam-radius-small",
        "control": "--sarvam-radius-control",
        "cardMobile": "--sarvam-radius-card-mobile",
        "cardDesktop": "--sarvam-radius-card-desktop",
        "panel": "--sarvam-radius-panel",
        "nav": "--sarvam-radius-nav",
        "campaign": "--sarvam-radius-campaign",
        "pill": "--sarvam-radius-pill",
    }
    for name, css_name in radius_vars.items():
        check_var(css_name, tokens["radii"][name])

    required_fragments = [
        "font-family: var(--sarvam-font-body)",
        "font-family: var(--sarvam-font-display)",
        "font-family: var(--sarvam-font-metadata)",
        "font-weight: var(--matter-weight-normal)",
        "font-weight: var(--season-mix-weight-normal)",
        "min-height: var(--sarvam-touch-target)",
        "@media (min-width: 48rem)",
        "@media (min-width: 64rem)",
        "@media (prefers-reduced-motion: reduce)",
        ":focus-visible",
    ]
    if args.mode == "official":
        required_fragments.extend(
            [
                'font-family: "Matter"',
                'font-family: "Matter Semi Mono"',
                'font-family: "Season Mix"',
                "font-weight: 100 1000",
                "font-weight: 300 900",
            ]
        )
    for fragment in required_fragments:
        if fragment not in css:
            failures.append(f"missing required CSS fragment: {fragment}")

    if failures:
        print(f"Theme validation failed for {args.css} in {args.mode} mode:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    fixed_token_count = (
        len(tokens["colors"])
        + (len(tokens["fonts"]) if args.mode == "official" else 1)
        + sum(len(group) for group in tokens["weights"].values())
        + len(tokens["layout"])
        + len(tokens["breakpoints"])
        + len(tokens["radii"])
    )
    print(
        f"Theme validation passed for {args.css} in {args.mode} mode: "
        f"{fixed_token_count} fixed snapshot tokens, {len(ACTIVE_FONT_VARS)} active font "
        f"roles, and {len(required_fragments)} structural checks."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
