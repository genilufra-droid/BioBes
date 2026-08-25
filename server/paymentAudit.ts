export function paymentAuditDetails(paymentNumber: string, action: "CREATE" | "POST") {
  return action === "CREATE" ? `U krijua pagesa ${paymentNumber}.` : `U postua pagesa ${paymentNumber}.`;
}
