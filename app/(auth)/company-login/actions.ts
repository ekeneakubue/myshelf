'use server';

import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function signIn(email: string, password: string) {
  try {
    const hashedPassword = hashPassword(password);
    
    // Find user with their company membership
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user || user.passwordHash !== hashedPassword) {
      return { success: false, error: "Invalid email or password" };
    }

    // Find active membership for the user
    const activeMembership = user.memberships.find(
      m => m.status === 'ACTIVE' && (m.role === 'ADMIN' || m.role === 'OWNER')
    );

    if (!activeMembership) {
      return { success: false, error: "No active admin access found" };
    }

    const company = activeMembership.company;

    if (!company.isActive) {
      return { success: false, error: "Company account is inactive" };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('company-session', JSON.stringify({
      userId: user.id,
      companyId: company.id,
      companySlug: company.slug,
      role: activeMembership.role
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return { 
      success: true, 
      companySlug: company.slug,
      companyName: company.name,
      userRole: activeMembership.role
    };
  } catch (error) {
    console.error('Company login error:', error);
    return { success: false, error: "Server error. Please try again." };
  }
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('company-session');
    redirect('/company-login');
  } catch (error) {
    console.error('Company logout error:', error);
    redirect('/company-login');
  }
}
