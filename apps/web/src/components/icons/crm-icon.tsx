import type { ReactNode } from "react";

export type CRMIconName =
  | "dashboard"
  | "customers"
  | "stock"
  | "offers"
  | "orders"
  | "payments"
  | "warehouse"
  | "delivery"
  | "invoices"
  | "returns"
  | "factories"
  | "erp"
  | "whatsapp"
  | "ai"
  | "documents"
  | "reports"
  | "users"
  | "roles"
  | "settings";

function iconPath(name: CRMIconName): ReactNode {
  switch (name) {
    case "dashboard":
      return (
        <>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="4" rx="1.5" />
          <rect x="14" y="10" width="7" height="11" rx="2" />
          <rect x="3" y="13" width="7" height="8" rx="2" />
        </>
      );
    case "customers":
      return (
        <>
          <circle cx="8" cy="8" r="3" />
          <path d="M3 20c0-3 2-5 5-5s5 2 5 5" />
          <circle cx="18" cy="9" r="2.5" />
          <path d="M14 20c.2-2.2 1.8-3.8 4-4" />
        </>
      );
    case "stock":
      return (
        <>
          <path d="M4 8 12 4l8 4-8 4-8-4Z" />
          <path d="M4 8v8l8 4 8-4V8" />
          <path d="M12 12v8" />
        </>
      );
    case "offers":
      return (
        <>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      );
    case "orders":
      return (
        <>
          <path d="M4 6h17l-2 9H7L4 6Z" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="17" cy="19" r="1.5" />
          <path d="M4 6 3 3H1" />
        </>
      );
    case "payments":
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <path d="M3 10h18" />
          <path d="M8 15h2" />
        </>
      );
    case "warehouse":
      return (
        <>
          <path d="M3 9 12 4l9 5v11H3V9Z" />
          <path d="M8 20v-6h8v6" />
        </>
      );
    case "delivery":
      return (
        <>
          <path d="M3 7h10v8H3z" />
          <path d="M13 10h4l3 3v2h-7z" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </>
      );
    case "invoices":
      return (
        <>
          <path d="M6 3h10l3 3v15H6z" />
          <path d="M16 3v4h3" />
          <path d="M9 11h7M9 15h7" />
        </>
      );
    case "returns":
      return (
        <>
          <path d="M8 7H4v4" />
          <path d="M4 11a7 7 0 1 0 2-5" />
        </>
      );
    case "factories":
      return (
        <>
          <path d="M3 20V8l5 3V8l5 3V6l8 4v10H3Z" />
          <path d="M7 20v-4h3v4" />
        </>
      );
    case "erp":
      return (
        <>
          <rect x="3" y="4" width="8" height="6" rx="1.5" />
          <rect x="13" y="4" width="8" height="6" rx="1.5" />
          <rect x="8" y="14" width="8" height="6" rx="1.5" />
          <path d="M7 10v2h9v2" />
        </>
      );
    case "whatsapp":
      return (
        <>
          <path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.2-1.1A8 8 0 1 0 12 4Z" />
          <path d="M9 10c.4 1.2 1.8 2.6 3 3l1-.8c.4-.2.7-.1 1 .1l1.2 1.2c.2.3.2.7 0 1-.6.8-1.5 1-2.3.8-2.8-.7-5.8-3.6-6.5-6.5-.2-.8 0-1.7.8-2.3.3-.2.7-.2 1 0L9.4 7c.2.3.3.6.1 1L9 9Z" />
        </>
      );
    case "ai":
      return (
        <>
          <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
          <path d="M9 12h6M12 9v6" />
        </>
      );
    case "documents":
      return (
        <>
          <path d="M6 3h10l3 3v15H6z" />
          <path d="M9 10h6M9 14h6M9 18h4" />
        </>
      );
    case "reports":
      return (
        <>
          <path d="M4 19h16" />
          <rect x="6" y="11" width="3" height="6" rx="1" />
          <rect x="11" y="8" width="3" height="9" rx="1" />
          <rect x="16" y="5" width="3" height="12" rx="1" />
        </>
      );
    case "users":
      return (
        <>
          <circle cx="8" cy="8" r="3" />
          <path d="M3 20c0-3 2-5 5-5s5 2 5 5" />
          <path d="M16 8h5M18.5 5.5v5" />
        </>
      );
    case "roles":
      return (
        <>
          <path d="M12 3 4 7v6c0 4 3 7 8 8 5-1 8-4 8-8V7l-8-4Z" />
          <path d="M9.5 12.5 11 14l3.5-3.5" />
        </>
      );
    case "settings":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9h.1a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6Z" />
        </>
      );
    default:
      return null;
  }
}

export function CRMIcon({ name }: { name: CRMIconName }) {
  return (
    <svg viewBox="0 0 24 24" className="crm-icon" fill="none" stroke="currentColor" strokeWidth="1.8">
      {iconPath(name)}
    </svg>
  );
}
