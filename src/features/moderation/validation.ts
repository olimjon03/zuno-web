export const reportReasons = {
 scam: "Suspected scam", prohibited: "Prohibited item", misleading: "Misleading listing", duplicate: "Duplicate or spam", other: "Other concern",
} as const;
export type ReportReason = keyof typeof reportReasons;
export function parseReport(reason: unknown, details: unknown) {
 if(typeof reason!=="string" || !Object.hasOwn(reportReasons,reason))throw new Error("Choose a report reason.");
 if(typeof details!=="string" || Array.from(details).length>1000)throw new Error("Keep report details within 1,000 characters.");
 return {reason:reason as ReportReason,details:details.trim()};
}
