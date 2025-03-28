import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require('../../../service-account-key.json')),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ error: 'Missing userId or fcmToken' });
  }

  try {
    const message = {
      notification: {
        title: 'Delivery Confirmed',
        body: 'Your delivery has been confirmed by the admin.',
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    res.status(200).json({ message: 'Notification sent', response });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
      details: error.message || 'Unknown error',
    });
  }
}