"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

const API_KEY = process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY || "";
const SMTP_USERNAME = process.env.NEXT_PUBLIC_CHOOSE_PDF_SMTP_USERNAME || "";
const SMTP_PASSWORD = process.env.NEXT_PUBLIC_CHOOSE_PDF_SMTP_PASSWORD || "";

interface SendEmailProps {
  toEmail: string;
  fileUrl: string;
}

const SendPdfEmail: React.FC<SendEmailProps> = ({ toEmail, fileUrl }) => {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!toEmail || !fileUrl) {
      alert("Recipient email and file URL are required");
      return;
    }

    setLoading(true);

    const payload = {
      url: fileUrl,
      from: `CHOOSEPDF <${SMTP_USERNAME}>`,
      to: toEmail,
      subject: "Download Your Converted File from WhatPDF",
      bodytext: `Hello,
    
    Your PDF has been securely protected with a password using WhatPDF.com.
    You can download your protected PDF from the following link: ${fileUrl}
    
    Keep your password safe to access the file.
    
    Thank you,
    The WhatPDF Team`,
      bodyHtml: `
        <p className="bg-black">Hello,</p>
        <p>Your PDF has been securely converted and processed using <strong><a href="www.whatpdf.com" target="_blank">Download PDF</a></strong>.</p>
        <p>You can download your  PDF from the link below:</p>
        <p>Download PDF</a></p>
        <p>Keep your pdf safe to access the file.</p>
        <p>Thank you,<br />The choosepdf Team</p>
      `,
      smtpserver: "smtp.gmail.com",
      smtpport: "587",
      smtpusername: SMTP_USERNAME,
      smtppassword: SMTP_PASSWORD,
      async: false,
    };
    

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CHOOSE_PDF_API_EMAIL_SEND_URL as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.error) {
        toast("Email sent successfully", {
          description: "Your email has been delivered.",
          style: {
            background: "#fef0e9",   // dark background
            color: "#ff550d",           // white text
            fontWeight: "bold",
            fontSize: "16px",
            borderRadius: "8px",
            padding: "4px",
          },
        }) 
      } else {
        alert("contact choosepdf support team");
      }
    } catch (err) {
      console.error(err);
      alert("contact choosepdf support team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSend}
      disabled={loading || !fileUrl || !toEmail}
      className="bg-[#f16625] text-white"
    >
      {loading ? "Sending..." : "Send Email"}
    </Button>
  );
};

export default SendPdfEmail;
