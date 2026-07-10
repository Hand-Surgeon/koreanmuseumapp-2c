import { notFound } from "next/navigation"

/**
 * The administration surface remains unavailable until server-side
 * authentication, authorization, CSRF protection, and persistent storage
 * are implemented.
 */
export default function DisabledAdminPage() {
  notFound()
}
