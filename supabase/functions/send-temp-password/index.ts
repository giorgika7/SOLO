import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email }: RequestBody = await req.json();

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to process request" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const user = users.users.find((u) => u.email === normalizedEmail);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "No account found with this email address" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let tempPassword = "";
    for (let i = 0; i < 8; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: tempPassword,
        user_metadata: {
          ...user.user_metadata,
          temp_password: true,
          temp_password_created_at: new Date().toISOString(),
        },
      }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to generate temporary password" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">SOLO eSIM - Your Temporary Password</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your SOLO eSIM account.</p>
        <p>Your temporary password is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #000; letter-spacing: 2px; margin: 0;">${tempPassword}</h1>
        </div>
        <p><strong>Important:</strong></p>
        <ul>
          <li>This password is temporary and will expire after your first login or in 24 hours</li>
          <li>Please login and change your password immediately in Profile > Change Password</li>
          <li>If you didn't request this, please contact support immediately</li>
        </ul>
        <p>Best regards,<br/>SOLO eSIM Team</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    let responseData: { success: boolean; message: string; debug_password?: string } = {
      success: true,
      message: "Temporary password has been sent to your email",
    };

    if (resendApiKey) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SOLO eSIM <noreply@solo-esim.com>",
          to: [normalizedEmail],
          subject: "SOLO eSIM - Your Temporary Password",
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        console.error("Failed to send email via Resend");
      }
    } else {
      console.log("⚠️ DEVELOPMENT ONLY - REMOVE IN PRODUCTION");
      console.log("Email would be sent to:", normalizedEmail);
      console.log("Temporary password:", tempPassword);

      responseData.debug_password = tempPassword;
      responseData.message = "Temporary password generated (no email service configured)";
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});