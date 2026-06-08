export interface JwtPayload {
  userId: string;
  role: string;
  tenantId?: string;
  tenantRole?: string;
  type: "access" | "refresh";
  sessionId?: string;
}
