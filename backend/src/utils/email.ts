import nodemailer from 'nodemailer';
import logger from './logger';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('SMTP credentials not found. Skipping email send.');
      return;
    }

    const info = await transporter.sendMail({
      from: `NovaShop <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    logger.info(`Message sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error}`);
    throw error;
  }
};

const getItemsHtml = (items: any[]) => {
  if (!items || items.length === 0) return '';
  
  let html = `<div style="margin-bottom: 25px;">
    <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 15px; font-weight: bold; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse;">`;
    
  items.forEach(item => {
    const product = item.product || {};
    let imgUrl = (product.images && product.images.length > 0) 
      ? (product.images[0].url || product.images[0]) 
      : 'https://via.placeholder.com/60';
      
    if (typeof imgUrl === 'string' && imgUrl.startsWith('/')) {
      imgUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}${imgUrl}`;
    }
      
    html += `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #27272a; width: 70px;">
          <img src="${imgUrl}" alt="${product.name || 'Product'}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; background-color: #27272a;" />
        </td>
        <td style="padding: 10px 15px; border-bottom: 1px solid #27272a; text-align: left;">
          <p style="margin: 0; color: #ffffff; font-weight: bold; font-size: 15px;">${product.name || 'Product'}</p>
          <p style="margin: 5px 0 0 0; color: #a1a1aa; font-size: 13px;">Qty: ${item.quantity}</p>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #27272a; text-align: right;">
          <p style="margin: 0; color: #ffffff; font-weight: bold; font-size: 15px;">$${Number(item.price).toFixed(2)}</p>
        </td>
      </tr>
    `;
  });
  
  html += `</table></div>`;
  return html;
};

export const generateOrderStatusEmail = (orderId: string, status: string, name: string, items: any[] = []) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'PROCESSING': return 'We have started processing your order. It will be shipped soon!';
      case 'SHIPPED': return 'Great news! Your order has been shipped and is on its way to you.';
      case 'DELIVERED': return 'Your order has been delivered. Enjoy your items!';
      case 'CANCELLED': return 'Your order has been cancelled.';
      default: return 'Your order status has been updated.';
    }
  };

  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/track/${orderId}`;
  const itemsHtml = getItemsHtml(items);

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #ffffff; padding: 40px 20px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px; color: #ffffff;">Nova<span style="color: #3b82f6;">Shop</span></h1>
      </div>
      
      <div style="background-color: #18181b; padding: 30px; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Order Status Update</h2>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Hi ${name || 'Customer'},</p>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">${getStatusMessage()}</p>
        
        <div style="background: #27272a; padding: 20px; border-radius: 8px; margin: 0 0 25px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Order Number</p>
          <p style="margin: 0 0 15px 0; font-size: 20px; font-weight: 900; color: #ffffff;">#${orderId.slice(-6).toUpperCase()}</p>
          
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Current Status</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #3b82f6;">${status}</p>
        </div>

        ${itemsHtml}
        
        <div style="text-align: center; margin-top: 35px; margin-bottom: 10px;">
          <a href="${trackingUrl}" style="background-color: #ffffff; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 16px; display: inline-block;">Track Your Order</a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <p style="color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} NovaShop. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateOrderConfirmationEmail = (orderId: string, name: string, total: number, items: any[] = []) => {
  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/track/${orderId}`;
  const itemsHtml = getItemsHtml(items);

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #ffffff; padding: 40px 20px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px; color: #ffffff;">Nova<span style="color: #3b82f6;">Shop</span></h1>
      </div>
      
      <div style="background-color: #18181b; padding: 30px; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Order Confirmation</h2>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Hi ${name || 'Customer'},</p>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">Thank you for your order! We have successfully received it and will start processing it shortly.</p>
        
        <div style="background: #27272a; padding: 20px; border-radius: 8px; margin: 0 0 25px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Order Number</p>
          <p style="margin: 0 0 15px 0; font-size: 20px; font-weight: 900; color: #ffffff;">#${orderId.slice(-6).toUpperCase()}</p>
          
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Total Amount</p>
          <p style="margin: 0; font-size: 22px; font-weight: 900; color: #10b981;">$${total.toFixed(2)}</p>
        </div>

        ${itemsHtml}
        
        <div style="text-align: center; margin-top: 35px; margin-bottom: 10px;">
          <a href="${trackingUrl}" style="background-color: #ffffff; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 16px; display: inline-block;">Track Your Order</a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <p style="color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} NovaShop. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generatePasswordResetEmail = (name: string, code: string) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #ffffff; padding: 40px 20px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px; color: #ffffff;">Nova<span style="color: #3b82f6;">Shop</span></h1>
      </div>
      
      <div style="background-color: #18181b; padding: 30px; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 20px; color: #ffffff;">Password Reset Request</h2>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Hi ${name || 'Customer'},</p>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">We received a request to reset your password. Use the verification code below to complete the process. This code is valid for 15 minutes.</p>
        
        <div style="background: #27272a; padding: 20px; border-radius: 8px; margin: 0 0 25px 0; border-left: 4px solid #8b5cf6; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your Verification Code</p>
          <p style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ffffff;">${code}</p>
        </div>
        
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin-top: 25px;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <p style="color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} NovaShop. All rights reserved.</p>
      </div>
    </div>
  `;
};
