'use server';

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { redirect } from "next/navigation";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function signIn(formData: FormData) {
  try {
    const email = String(formData.get("email") || "").toLowerCase().trim();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    // Find user with their company membership
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check password
    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check if user has an active membership with a company
    const activeMembership = user.memberships.find(m => m.status === 'ACTIVE');
    if (!activeMembership) {
      return { success: false, error: "No active company membership found" };
    }

    // Check if user is admin or owner
    if (!['ADMIN', 'OWNER'].includes(activeMembership.role)) {
      return { success: false, error: "Access denied. Admin privileges required." };
    }

    // Create session data
    const sessionData = {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      companyId: activeMembership.companyId,
      companyName: activeMembership.company.name,
      companySlug: activeMembership.company.slug,
      role: activeMembership.role
    };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: "An error occurred during sign in" };
  }
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    // Return success; let client navigate to avoid server action redirect fetch errors
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false };
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return null;
    }
    const raw = sessionCookie.value;
    // Guard against empty/malformed cookie values
    if (!raw || raw.trim().length === 0) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      // Malformed cookie: treat as no session (do not modify cookies here)
      return null;
    }
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}
