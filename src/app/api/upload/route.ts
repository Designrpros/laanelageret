// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin using environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Fix newline formatting
};

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No authorization token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    await getAuth().verifyIdToken(token);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const storage = getStorage().bucket();
    const fileName = `uploads/${Date.now()}_${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await storage.file(fileName).save(buffer, {
      metadata: { contentType: file.type },
    });

    const [url] = await storage.file(fileName).getSignedUrl({
      action: "read",
      expires: "03-20-2026", // Adjust expiration as needed
    });

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}