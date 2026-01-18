export const ERROR_CODES = {
  // Generic
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",

  // Validation
  INVALID_NAME: "INVALID_NAME",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_PHONE: "INVALID_PHONE",

  // Orders
  ORDERS_DISABLED: "ORDERS_DISABLED",
  EMPTY_CART: "EMPTY_CART",
  STORE_NOT_FOUND: "STORE_NOT_FOUND",
  STORE_INACTIVE: "STORE_INACTIVE",
  INVALID_PRODUCTS: "INVALID_PRODUCTS",
  INVALID_PAYMENT_METHOD: "INVALID_PAYMENT_METHOD",

  // B2B
  B2B_AUTH_REQUIRED: "B2B_AUTH_REQUIRED",
  APPLICATION_EXISTS: "APPLICATION_EXISTS",
  ORGANIZATION_NOT_FOUND: "ORGANIZATION_NOT_FOUND",

  // DB
  DB_ERROR: "DB_ERROR",
  DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Optional: User-friendly messages (Slovak)
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INTERNAL_SERVER_ERROR: "Nastala neočakávaná chyba",
  BAD_REQUEST: "Neplatná požiadavka",
  UNAUTHORIZED: "Nie ste prihlásený",
  FORBIDDEN: "Nemáte oprávnenie",
  NOT_FOUND: "Nenájdené",
  CONFLICT: "Konflikt dát",

  INVALID_NAME: "Meno je povinné",
  INVALID_EMAIL: "Neplatný email",
  INVALID_PHONE: "Neplatné telefónne číslo",

  ORDERS_DISABLED: "Objednávky sú momentálne vypnuté",
  EMPTY_CART: "Košík je prázdny",
  STORE_NOT_FOUND: "Predajňa neexistuje",
  STORE_INACTIVE: "Predajňa je zatvorená",
  INVALID_PRODUCTS: "Niektoré produkty nie sú dostupné",
  INVALID_PAYMENT_METHOD: "Neplatný spôsob platby",

  B2B_AUTH_REQUIRED: "Vyžaduje sa B2B prihlásenie",
  APPLICATION_EXISTS: "Žiadosť už existuje",
  ORGANIZATION_NOT_FOUND: "Organizácia nenájdená",

  DB_ERROR: "Chyba databázy",
  DB_CONNECTION_ERROR: "Chyba pripojenia k databáze",
};

// Helper: get user message
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
}
