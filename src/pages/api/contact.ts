import type { APIRoute } from 'astro';
import { saveContactMessage, generateId } from '../../lib/dataStorage.js';
import type { ContactFormData } from '../../lib/dataStorage.js';
import { Resend } from 'resend';

// Admin email configuration
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@qa-site.com';
const FROM_EMAIL = import.meta.env.FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@qa-site.com';

/**
 * Send email notification to admin when a new contact message is received
 */
async function sendAdminNotification(contactData: ContactFormData): Promise<void> {
  // Skip email sending if Resend API key is not configured
  const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  console.log('Environment check - RESEND_API_KEY exists:', !!resendApiKey);
  console.log('Environment check - RESEND_API_KEY length:', resendApiKey?.length || 0);
  console.log('Environment check - import.meta.env.RESEND_API_KEY:', !!import.meta.env.RESEND_API_KEY);
  console.log('Environment check - process.env.RESEND_API_KEY:', !!process.env.RESEND_API_KEY);
  
  if (!resendApiKey) {
    console.info('Email notifications disabled (RESEND_API_KEY not configured). Contact message saved to database.');
    return;
  }

  // Initialize Resend only when we need it and have the API key
  const resend = new Resend(resendApiKey);

  try {
    const emailContent = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">رسالة جديدة من موقع الأسئلة والأجوبة</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-bottom: 15px; font-size: 18px;">تفاصيل المرسل:</h2>
            <p style="margin: 8px 0; color: #4b5563;"><strong>الاسم:</strong> ${contactData.name}</p>
            <p style="margin: 8px 0; color: #4b5563;"><strong>البريد الإلكتروني:</strong> ${contactData.email}</p>
            <p style="margin: 8px 0; color: #4b5563;"><strong>التاريخ:</strong> ${new Date(contactData.timestamp).toLocaleString('ar-SA', { 
              timeZone: 'Asia/Riyadh',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="color: #374151; margin-bottom: 10px; font-size: 18px;">الموضوع:</h2>
            <p style="background-color: #eff6ff; padding: 15px; border-radius: 6px; color: #1e40af; font-weight: 500; margin: 0;">${contactData.subject}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="color: #374151; margin-bottom: 10px; font-size: 18px;">الرسالة:</h2>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; border-right: 4px solid #3b82f6;">
              <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${contactData.message}</p>
            </div>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-right: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>معرف الرسالة:</strong> ${contactData.id}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>هذه رسالة تلقائية من موقع الأسئلة والأجوبة</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `رسالة جديدة: ${contactData.subject}`,
      html: emailContent,
      replyTo: contactData.email, // Allow admin to reply directly to the sender
    });

    if (error) {
      console.error('Failed to send admin notification email:', error);
      // Don't throw error - we don't want to fail the contact form submission if email fails
    } else {
      console.log('Admin notification email sent successfully:', data?.id);
    }
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    // Don't throw error - we don't want to fail the contact form submission if email fails
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation - check required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'جميع الحقول مطلوبة' // All fields required in Arabic
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate field lengths
    if (name.trim().length < 2) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'الاسم يجب أن يكون على الأقل حرفين' // Name must be at least 2 characters
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (subject.trim().length < 3) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'الموضوع يجب أن يكون على الأقل 3 أحرف' // Subject must be at least 3 characters
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (message.trim().length < 10) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'الرسالة يجب أن تكون على الأقل 10 أحرف' // Message must be at least 10 characters
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'عنوان البريد الإلكتروني غير صحيح' // Invalid email address in Arabic
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create contact message data
    const contactData: ContactFormData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date(),
      id: generateId()
    };

    // Save contact message to storage (KV or fallback)
    await saveContactMessage(contactData);

    // Send email notification to admin using Resend
    await sendAdminNotification(contactData);

    console.log(`Contact message received from: ${contactData.email} - Subject: ${contactData.subject}`);

    // Return success response
    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً' // Message sent successfully, we'll contact you soon
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: 'خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى' // Error sending message, please try again
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};