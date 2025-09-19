'use server';

import { prisma } from "@/lib/prisma";
import { getSession } from '@/app/(auth)/login/actions';
import crypto from "node:crypto";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function getCompanyStaff() {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }

    const users = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            companyId: session.companyId,
            status: 'ACTIVE'
          }
        }
      },
      include: {
        memberships: {
          where: {
            companyId: session.companyId,
            status: 'ACTIVE'
          },
          include: {
            company: true
          }
        }
      }
    });

    return users.map(user => {
      const membership = user.memberships[0];
      const prismaRole = membership?.role || 'MEMBER';

      return {
        id: user.id,
        name: user.name || 'No name',
        email: user.email,
        role: prismaRole, // Directly from storage (OWNER | ADMIN | MEMBER)
        company: membership?.company?.name || 'No company',
        status: membership?.status || 'INACTIVE',
        createdAt: user.createdAt,
      };
    });
  } catch (error) {
    console.error('Error fetching company staff:', error);
    return [];
  }
}

export async function createCompanyStaff(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No session found' };
    }

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").toLowerCase().trim();
    const role = String(formData.get("role") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!name || !email || !password) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
      }
    });

    // Map custom roles to Prisma enum values
    let prismaRole: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' = 'MEMBER';
    switch (role.toLowerCase()) {
      case 'super-admin':
        prismaRole = 'OWNER';
        break;
      case 'admin':
        prismaRole = 'ADMIN';
        break;
      case 'manager':
        prismaRole = 'MANAGER';
        break;
      case 'staff':
      default:
        prismaRole = 'MEMBER';
    }

    // Create membership for the user in the current company
    await prisma.membership.create({
      data: {
        userId: user.id,
        companyId: session.companyId,
        role: prismaRole,
        status: 'ACTIVE',
      }
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Error creating staff:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateCompanyStaff(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No session found' };
    }

    const staffId = String(formData.get("staffId") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").toLowerCase().trim();
    const role = String(formData.get("role") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!staffId || !name || !email) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if user exists and belongs to the company
    const existingUser = await prisma.user.findUnique({
      where: { id: staffId },
      include: {
        memberships: {
          where: {
            companyId: session.companyId
          }
        }
      }
    });

    if (!existingUser || existingUser.memberships.length === 0) {
      return { success: false, error: "Staff member not found" };
    }

    // Check if email is being changed and if it already exists
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: { 
          email,
          id: { not: staffId }
        }
      });

      if (emailExists) {
        return { success: false, error: "User with this email already exists" };
      }
    }

    // Update the user
    const updateData: any = {
      name,
      email,
    };

    if (password) {
      updateData.passwordHash = hashPassword(password);
    }

    await prisma.user.update({
      where: { id: staffId },
      data: updateData
    });

    // Update membership role
    const membership = existingUser.memberships[0];
    if (membership) {
      let prismaRole: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' = 'MEMBER';
      switch (role.toLowerCase()) {
        case 'super-admin':
          prismaRole = 'OWNER';
          break;
        case 'admin':
          prismaRole = 'ADMIN';
          break;
        case 'manager':
          prismaRole = 'MANAGER';
          break;
        case 'staff':
        default:
          prismaRole = 'MEMBER';
      }

      await prisma.membership.update({
        where: { id: membership.id },
        data: { role: prismaRole }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating staff:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteCompanyStaff(staffId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No session found' };
    }

    // Check if user exists and belongs to the company
    const existingUser = await prisma.user.findUnique({
      where: { id: staffId },
      include: {
        memberships: {
          where: {
            companyId: session.companyId
          }
        }
      }
    });

    if (!existingUser || existingUser.memberships.length === 0) {
      return { success: false, error: "Staff member not found" };
    }

    // Delete the membership (user can exist in other companies)
    const membership = existingUser.memberships[0];
    await prisma.membership.delete({
      where: { id: membership.id }
    });

    // Check if user has other memberships
    const otherMemberships = await prisma.membership.findMany({
      where: { userId: staffId }
    });

    // If no other memberships, delete the user
    if (otherMemberships.length === 0) {
      await prisma.user.delete({
        where: { id: staffId }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting staff:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function promoteEmailToAdmin(email: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No session found' };
    }

    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, error: 'Email is required' };
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, companyId: session.companyId },
    });

    if (!membership) {
      return { success: false, error: 'Membership not found for this company' };
    }

    await prisma.membership.update({
      where: { id: membership.id },
      data: { role: 'ADMIN' },
    });

    return { success: true };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function promoteEmailToSuperAdmin(email: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No session found' };
    }

    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, error: 'Email is required' };
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, companyId: session.companyId },
    });

    if (!membership) {
      return { success: false, error: 'Membership not found for this company' };
    }

    await prisma.membership.update({
      where: { id: membership.id },
      data: { role: 'OWNER' },
    });

    return { success: true };
  } catch (error) {
    console.error('Error promoting user to super admin:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
