import emailjs from 'emailjs-com';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const emailService = {
  sendOtpEmail: async (email: string, otp: string, purpose: string): Promise<void> => {
    const templateParams = {
      user_email: email,
      otp: otp,
      purpose: purpose,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    } catch (error) {
      console.error('EmailJS Error:', error);
      throw new Error('Failed to send OTP. Please try again later.');
    }
  }
};
