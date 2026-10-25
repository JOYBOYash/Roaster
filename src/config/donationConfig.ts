/**
 * Roastie Optional Donation Configuration
 * 
 * Roastie is 100% free to use. Donations are strictly optional and must never block use or export.
 * To enable donations in production, set enabled to true and provide a valid qrImageUrl, upiId, or donationUrl.
 * Never fabricate payment addresses or fake QR codes.
 */

export interface DonationConfig {
  enabled: boolean;
  title: string;
  description: string;
  qrImageUrl?: string;
  upiId?: string;
  donationUrl?: string;
}

export const donationConfig: DonationConfig = {
  enabled: false, // Set to true when site owner configures a real donation destination
  title: "Support Roastie Development",
  description: "Roastie is 100% free and open for everyone. If you laughed or got cooked, feel free to drop a tip to keep the servers running!",
  qrImageUrl: "", // e.g. "/assets/donation-qr.png"
  upiId: "", // e.g. "roastie@upi"
  donationUrl: "https://buymeacoffee.com", // Optional link
};
