/**
 * NotFound
 *
 * 404 page component.
 * Uses design tokens from tokens.css.
 */

import { Link } from "react-router-dom";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-surface-800">404</h1>
          <p className="mt-2 text-surface-500">Page not found</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors duration-fast hover:bg-brand-700"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </Container>
  );
}
