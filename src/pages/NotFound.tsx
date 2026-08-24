/**
 * NotFound
 *
 * 404 page component.
 * Uses design tokens from tokens.css.
 */

import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-surface-800">404</h1>
          <p className="mt-2 text-surface-500">Page not found</p>
        </div>
      </div>
    </Container>
  );
}
