import { NextResponse } from "next/server";
import { getTenantId } from "../../../lib/tenant";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";

  const mockReq = {
    headers: { cookie: cookieHeader },
    cookies: Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("=")).filter(([k]) => k).map(([k, ...v]) => [k.trim(), v.join("=").trim()])
    ),
  };

  const token = await getToken({
    req: mockReq as any,
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-do-not-use-in-production",
  });

  const tenantId = await getTenantId();

  return NextResponse.json({
    tenantId,
    token: token ? { 
      email: token.email, 
      organizationId: token.organizationId,
      role: token.role 
    } : null,
    hasCookies: !!cookieHeader,
    cookieKeys: cookieHeader.split(";").map(c => c.trim().split("=")[0]).filter(Boolean),
  });
}
