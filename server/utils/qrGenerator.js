const QRCode = require('qrcode');

const generateQRCode = async (data) => {
    try {
        // Generate QR code as Data URL
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 1,
            margin: 1,
            color: {
                dark: '#21808d',
                light: '#FFFFFF'
            },
            width: 300
        });
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

module.exports = { generateQRCode };