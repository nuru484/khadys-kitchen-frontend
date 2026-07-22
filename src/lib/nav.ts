import type { NavLink } from "@/components/layout/site-header";
import { routes } from "@/lib/routes";

/**
 * The public site's primary navigation — identical on every page so the header
 * never reshuffles as you move around; the current page is marked active
 * (see HeaderNav / MobileNav). Home is listed explicitly (not just the logo)
 * so getting back from any page is an obvious, labelled click.
 */
export const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: "Home", href: routes.home },
  { label: "Trainings", href: routes.trainings },
  { label: "Gallery", href: routes.gallery },
  { label: "Contact", href: routes.contact },
];
