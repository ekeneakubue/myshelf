'use server';

import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function getCompanies() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            documents: true,
            memberships: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return companies.map(company => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      plan: company.plan,
      isActive: company.isActive,
      memberCount: company._count.memberships,
      documentCount: company._count.documents,
      createdAt: company.createdAt,
      owner: company.memberships.find(m => m.role === 'OWNER' || m.role === 'ADMIN')?.user || null
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

export async function createCompany(formData: FormData) {
  try {
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim().toLowerCase();
    const plan = String(formData.get("plan") || "FREE");
    const logoFile = formData.get("logo") as unknown as File | null;
    const ownerEmail = String(formData.get("ownerEmail") || "").toLowerCase().trim();
    const ownerName = String(formData.get("ownerName") || "").trim();
    const ownerPassword = String(formData.get("ownerPassword") || "").trim();
    const role = String(formData.get("role") || "admin").trim();

    if (!name || !slug || !ownerEmail || !ownerName || !ownerPassword) {
      throw new Error("Missing required fields");
    }

    // Check if company slug already exists
    const existingCompany = await prisma.company.findUnique({
      where: { slug }
    });

    if (existingCompany) {
      throw new Error("Company with this slug already exists");
    }

    // Check if owner email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail }
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // If logo was uploaded, save it under public/uploads and keep a public path
    let storedLogoUrl: string | null = null;
    if (logoFile && typeof (logoFile as any).arrayBuffer === 'function') {
      const bytes = Buffer.from(await logoFile.arrayBuffer());
      const originalName = (logoFile as any).name as string | undefined;
      const ext = (originalName && originalName.includes('.')) ? originalName.split('.').pop() : 'png';
      const fileName = `${slug}-${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, bytes);
      storedLogoUrl = `/uploads/${fileName}`;
    }

    // Create the company
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        logoUrl: storedLogoUrl,
        plan: plan as 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE',
        isActive: true,
      }
    });

    // Create the owner user
    const owner = await prisma.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        passwordHash: hashPassword(ownerPassword),
      }
    });

    // Map UI role to Prisma role
    let prismaRole: 'MEMBER' | 'ADMIN' | 'OWNER';
    if (role === 'super-admin') {
      prismaRole = 'OWNER';
    } else {
      prismaRole = 'ADMIN'; // Default admin role
    }

    // Create membership for the owner
    await prisma.membership.create({
      data: {
        userId: owner.id,
        companyId: company.id,
        role: prismaRole,
        status: 'ACTIVE',
      }
    });

    return { success: true, companyId: company.id };
  } catch (error) {
    console.error('Error creating company:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateCompany(formData: FormData) {
  try {
    const companyId = String(formData.get("companyId") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim().toLowerCase();
    const plan = String(formData.get("plan") || "FREE");
    const logoFile = formData.get("logo") as unknown as File | null;
    const ownerEmail = String(formData.get("ownerEmail") || "").toLowerCase().trim();
    const ownerName = String(formData.get("ownerName") || "").trim();
    const ownerPassword = String(formData.get("ownerPassword") || "").trim();
    const role = String(formData.get("role") || "admin").trim();

    if (!companyId || !name || !slug || !ownerEmail || !ownerName) {
      throw new Error("Missing required fields");
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        memberships: {
          include: { user: true }
        }
      }
    });

    if (!existingCompany) {
      throw new Error("Company not found");
    }

    // Check if slug is being changed and if new slug already exists
    if (slug !== existingCompany.slug) {
      const slugExists = await prisma.company.findFirst({
        where: { 
          slug,
          id: { not: companyId }
        }
      });

      if (slugExists) {
        throw new Error("Company with this slug already exists");
      }
    }

    // Handle optional new logo upload or fallback to provided URL
    let nextLogoUrl: string | null = null;
    if (logoFile && typeof (logoFile as any).arrayBuffer === 'function') {
      const bytes = Buffer.from(await logoFile.arrayBuffer());
      const originalName = (logoFile as any).name as string | undefined;
      const ext = (originalName && originalName.includes('.')) ? originalName.split('.').pop() : 'png';
      const fileName = `${slug}-${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, bytes);
      nextLogoUrl = `/uploads/${fileName}`;
    } else {
      const logoUrlText = String(formData.get("logoUrl") || "").trim();
      nextLogoUrl = logoUrlText || null;
    }

    // Update the company
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        slug,
        logoUrl: nextLogoUrl,
        plan: plan as 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE',
        isActive: true,
      }
    });

    // Get the current owner
    const currentOwner = existingCompany.memberships.find(m => 
      m.role === 'OWNER' || m.role === 'ADMIN'
    )?.user;

    if (currentOwner) {
      // Check if owner email is being changed
      if (ownerEmail !== currentOwner.email) {
        // Check if new email already exists
        const emailExists = await prisma.user.findFirst({
          where: { 
            email: ownerEmail,
            id: { not: currentOwner.id }
          }
        });

        if (emailExists) {
          throw new Error("User with this email already exists");
        }

        // Update owner user
        await prisma.user.update({
          where: { id: currentOwner.id },
          data: {
            name: ownerName,
            email: ownerEmail,
            ...(ownerPassword && { passwordHash: hashPassword(ownerPassword) })
          }
        });
      } else {
        // Just update name and password if provided
        await prisma.user.update({
          where: { id: currentOwner.id },
          data: {
            name: ownerName,
            ...(ownerPassword && { passwordHash: hashPassword(ownerPassword) })
          }
        });
      }

      // Update membership role if changed
      const currentMembership = existingCompany.memberships.find(m => 
        m.userId === currentOwner.id
      );

      if (currentMembership) {
        // Map UI role to Prisma role
        let prismaRole: 'MEMBER' | 'ADMIN' | 'OWNER';
        if (role === 'super-admin') {
          prismaRole = 'OWNER';
        } else {
          prismaRole = 'ADMIN'; // Default admin role
        }

        await prisma.membership.update({
          where: { id: currentMembership.id },
          data: { role: prismaRole }
        });
      }
    }

    return { success: true, companyId: updatedCompany.id };
  } catch (error) {
    console.error('Error updating company:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteCompany(companyId: string) {
  try {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        memberships: true,
        documents: true,
        _count: {
          select: {
            memberships: true,
            documents: true
          }
        }
      }
    });

    if (!existingCompany) {
      throw new Error("Company not found");
    }

    // Check if company has documents (optional safety check)
    if (existingCompany._count.documents > 0) {
      throw new Error("Cannot delete company with existing documents. Please remove all documents first.");
    }

    // Delete the company (memberships will be deleted due to cascade)
    await prisma.company.delete({
      where: { id: companyId }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting company:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
