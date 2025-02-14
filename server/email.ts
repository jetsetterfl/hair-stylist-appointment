import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

type AppointmentEmailData = {
  clientName: string;
  clientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  stylistName: string;
};

export async function sendAppointmentConfirmation(data: AppointmentEmailData) {
  console.log("Attempting to send email confirmation to:", data.clientEmail);

  const emailContent = `
    Dear ${data.clientName},

    Your appointment has been confirmed!

    Details:
    Date: ${data.date}
    Time: ${data.startTime} - ${data.endTime}
    Stylist: ${data.stylistName}

    Thank you for choosing our service!
  `;

  try {
    await mailService.send({
      to: data.clientEmail,
      from: 'appointments@hairstylist.com', // This email domain needs to be verified in SendGrid
      subject: 'Appointment Confirmation',
      text: emailContent,
    });
    console.log("Email sent successfully to:", data.clientEmail);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
}