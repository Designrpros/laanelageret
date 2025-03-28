import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fcmToken, title, body } = req.body;
  const serverKey = process.env.FCM_SERVER_KEY;

  if (!serverKey) {
    return res.status(500).json({ error: "Server key not configured" });
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${serverKey}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: { title, body },
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    res.status(200).json({ message: "Notification sent" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
}