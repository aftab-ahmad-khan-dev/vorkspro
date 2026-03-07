import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { ensureRegistry, getOrganizationModel } from "../database/registry.js";

/**
 * GET /config/company
 * Returns company info for the current user's organization (from JWT orgSlug).
 * Tenant users only; default/legacy users get 404.
 */
export const getCompany = asyncHandler(async (req, res) => {
  const orgSlug = req.orgSlug;
  if (!orgSlug) {
    return generateApiResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      "Company info is available for workspace accounts only.",
      null
    );
  }
  await ensureRegistry();
  const Organization = getOrganizationModel();
  const org = await Organization.findOne({ slug: orgSlug, status: "active" }).lean();
  if (!org) {
    return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Organization not found.", null);
  }
  return generateApiResponse(res, StatusCodes.OK, true, "Company info", {
    companyName: org.name || "",
    email: org.email || org.adminEmail || "",
    phone: org.phone || "",
    address: org.address || "",
    website: org.website || "",
    industry: org.industry || "",
  });
});

/**
 * PATCH /config/company
 * Updates company info for the current user's organization.
 * Body: { companyName?, email?, phone?, address?, website?, industry? }
 */
export const updateCompany = asyncHandler(async (req, res) => {
  const orgSlug = req.orgSlug;
  if (!orgSlug) {
    return generateApiResponse(
      res,
      StatusCodes.FORBIDDEN,
      false,
      "Company info can only be updated for workspace accounts."
    );
  }
  const { companyName, email, phone, address, website, industry } = req.body || {};
  await ensureRegistry();
  const Organization = getOrganizationModel();
  const org = await Organization.findOne({ slug: orgSlug, status: "active" });
  if (!org) {
    return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Organization not found.");
  }
  if (companyName !== undefined) org.name = String(companyName).trim();
  if (email !== undefined) org.email = String(email).trim().toLowerCase() || undefined;
  if (phone !== undefined) org.phone = String(phone).trim() || undefined;
  if (address !== undefined) org.address = String(address).trim() || undefined;
  if (website !== undefined) org.website = String(website).trim() || undefined;
  if (industry !== undefined) org.industry = String(industry).trim() || undefined;
  await org.save();
  return generateApiResponse(res, StatusCodes.OK, true, "Company info updated.", {
    companyName: org.name,
    email: org.email || org.adminEmail,
    phone: org.phone || "",
    address: org.address || "",
    website: org.website || "",
    industry: org.industry || "",
  });
});
