'use strict';
const nodemailer = require('nodemailer');

const sendPurchaseInstructions = async (
    callRequest,
    purchaseOrder,
    items,
    paymentOption,
    shippingOption,
    store
) => {
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_AUTH_USER,
            pass: process.env.EMAIL_AUTH_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    let itemsHtml = '';
    let total = 0;
    let item;
    for (item of items) {
        const { quantity, unitPrice, productName } = item;
        let subtotal = unitPrice * quantity;
        total += subtotal;
        itemsHtml += `<li style="font-size: 14px; line-height: 16px;">
            <span style="line-height: 16px; font-size: 14px;">
                ${quantity} - ${productName} ($${unitPrice} c/u) - $${subtotal} 
            </span></li>`;
    }

    itemsHtml += `<p style="font-size: 14px; line-height: 16px;">Total: $${total}</p>`;

    let followingSteps = '';
    // mercadopago payment option
    try {
        switch (parseInt(purchaseOrder.paymentOptionId)) {
            case 1:
                followingSteps += `RETIRE EL PRODUCTO POR ${store.name} (${store.address})`;
                break;
            case 2:
                console.log('PURCHASE ORDER');
                console.log(purchaseOrder);
                followingSteps += `REALICE EL PAGO A TRAVÉS DEL SIGUIENTE LINK: ${purchaseOrder.mercadopagoPreference.response.init_point}`;
                break;
        }
    } catch (err) {
        console.log(err);
    }

    let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
            <head>
                <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
                <meta content="width=device-width" name="viewport"/>
                <!--[if !mso]><!-->
                <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
                <!--<![endif]-->
                <title></title>
                <!--[if !mso]><!-->
                <!--<![endif]-->
                <style type="text/css">
                    body {
                        margin: 0;
                        padding: 0;
                    }
            
                    table,
                    td,
                    tr {
                        vertical-align: top;
                        border-collapse: collapse;
                    }
            
                    * {
                        line-height: inherit;
                    }
            
                    a[x-apple-data-detectors=true] {
                        color: inherit !important;
                        text-decoration: none !important;
                    }
                </style>
                <style id="media-query" type="text/css">
                    @media (max-width: 520px) {
            
                        .block-grid,
                        .col {
                            min-width: 320px !important;
                            max-width: 100% !important;
                            display: block !important;
                        }
            
                        .block-grid {
                            width: 100% !important;
                        }
            
                        .col {
                            width: 100% !important;
                        }
            
                        .col>div {
                            margin: 0 auto;
                        }
            
                        img.fullwidth,
                        img.fullwidthOnMobile {
                            max-width: 100% !important;
                        }
            
                        .no-stack .col {
                            min-width: 0 !important;
                            display: table-cell !important;
                        }
            
                        .no-stack.two-up .col {
                            width: 50% !important;
                        }
            
                        .no-stack .col.num4 {
                            width: 33% !important;
                        }
            
                        .no-stack .col.num8 {
                            width: 66% !important;
                        }
            
                        .no-stack .col.num4 {
                            width: 33% !important;
                        }
            
                        .no-stack .col.num3 {
                            width: 25% !important;
                        }
            
                        .no-stack .col.num6 {
                            width: 50% !important;
                        }
            
                        .no-stack .col.num9 {
                            width: 75% !important;
                        }
            
                        .video-block {
                            max-width: none !important;
                        }
            
                        .mobile_hide {
                            min-height: 0px;
                            max-height: 0px;
                            max-width: 0px;
                            display: none;
                            overflow: hidden;
                            font-size: 0px;
                        }
            
                        .desktop_hide {
                            display: block !important;
                            max-height: none !important;
                        }
                    }
                </style>
            </head>
            <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;">
                <!--[if IE]><div class="ie-browser"><![endif]-->
                <table bgcolor="#FFFFFF" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF; width: 100%;" valign="top" width="100%">
                    <tbody>
                        <tr style="vertical-align: top;" valign="top">
                            <td style="word-break: break-word; vertical-align: top;" valign="top">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#FFFFFF"><![endif]-->
                                <div style="background-color:transparent;">
                                    <div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;">
                                        <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                                            <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                                            <div class="col num12" style="min-width: 320px; max-width: 500px; display: table-cell; vertical-align: top; width: 500px;">
                                                <div style="width:100% !important;">
                                                    <!--[if (!mso)&(!IE)]><!-->
                                                    <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
                                                        <!--<![endif]-->
                                                        <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]-->
                                                        <div style="color:#555555;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;line-height:120%;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
                                                            <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 14px; color: #555555;">
                                                                <p style="font-size: 14px; line-height: 16px; margin: 0;"><span style="line-height: 16px; font-size: 14px;">Gracias por tu compra en <strong>${store.name}</strong>!</span></p>
                                                                <p style="font-size: 14px; line-height: 16px; margin: 0;"> </p>
                                                                
                                                                <p style="font-size: 14px; line-height: 16px; margin: 0;"><span style="line-height: 16px; font-size: 14px;"><strong>Productos</strong></span></p>
                                                                <ul>
                                                                    ${itemsHtml}
                                                                </ul>
                                                                
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"> </span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"><strong>Método de envío</strong></span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;">${shippingOption.description}</span></p>
                                                                
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"> </span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"><strong>Costo de envío</strong></span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;">$${purchaseOrder.shippingPrice}</span></p>
                                                                
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"> </span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"><strong>Forma de pago</strong></span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;">${paymentOption.description}</span></p>
                                                                
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"> </span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"><strong>Provincia</strong></span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;">${purchaseOrder.province}</span></p>
                                                                
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"> </span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"><strong>Ciudad</strong></span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;">${purchaseOrder.city}</span></p>
                                                                
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"> </span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;"><strong>Dirección</strong></span></p>
                                                                <p style="font-size: 12px; line-height: 16px; margin: 0;"><span style="font-size: 14px;">${purchaseOrder.address}</span></p>
                                                                
                                                                <p style="font-size: 12px; line-height: 14px; margin: 0;"> </p>
                                                                <p style="font-size: 12px; line-height: 14px; text-align: center; margin: 0;"><strong><span style="font-size: 14px; line-height: 16px;">Para finalizar siga los siguientes pasos</span></strong></p>
                                                                ${followingSteps}
                                                            </div>
                                                        </div>
                                                        <!--[if mso]></td></tr></table><![endif]-->
                                                        <!--[if (!mso)&(!IE)]><!-->
                                                    </div>
                                                    <!--<![endif]-->
                                                </div>
                                            </div>
                                            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                            <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                        </div>
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                            </td>
                        </tr>
                    </tbody>
                </table>
            <!--[if (IE)]></div><![endif]-->
            </body>
        </html>`;

    // send mail with defined transport object
    try {
        let info = await transporter.sendMail({
            from:
                '"Matías Nuñez de Video Call Shop 👻" <info@videocallshop.com>', // sender address
            to: callRequest.email, // list of receivers
            subject: 'Gracias por tu compra en Video Call Shop ✔', // Subject line
            html, // html body
        });

        console.log('Email sent: %s', info.messageId);
    } catch (err) {
        console.log('sendPurchaseInstructions error', err);
    }
};

module.exports = {
    sendPurchaseInstructions,
};
