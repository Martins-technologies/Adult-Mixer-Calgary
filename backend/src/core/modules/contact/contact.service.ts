import { prisma } from "../../../config/prisma";
import { EmailService } from "../../services/email.service";
import { ContactMessageInput } from "./contact.validation";

export class ContactService {
  static async submitMessage(data: ContactMessageInput, userId?: string) {
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
        userId: userId ?? null,
      },
    });

    await EmailService.sendContactNotification(
      data.name,
      data.email,
      data.message,
    );

    return {
      id: contactMessage.id,
      message: "Your message has been sent successfully. We'll get back to you soon!",
    };
  }
}
