import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { UPLOAD_PATHNAME } from "@/lib/blob-images";

/**
 * Issues short-lived upload tokens so the admin's browser can send photos straight to
 * Vercel Blob (no file size limit from this server). Only logged-in admins get a token,
 * and only for image files at the expected path.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Please log in again.");
        if (!UPLOAD_PATHNAME.test(pathname)) throw new Error("Invalid upload path.");
        return {
          allowedContentTypes: ["image/webp", "image/jpeg"],
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
