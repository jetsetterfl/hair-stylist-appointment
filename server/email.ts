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
      from: 'appointments@hairstylist.com', // Update this with your verified sender
      subject: 'Appointment Confirmation',
      text: emailContent,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
