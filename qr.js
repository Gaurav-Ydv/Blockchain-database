const privkey = require('./test');
const SHA256 = require("crypto-js/sha256");

// generateQR.js
const address =  SHA256 ( privkey ).toString();

const fs = require('fs');
const QRCode = require('qrcode');

// Data to encode in the QR code
const data = address;

// Generate QR code
QRCode.toFile('./qr-code.png', data, (err) => {
  if (err) {
    console.error('Error generating QR code:', err);
  } else {
    console.log('QR code generated successfully!');
  }
});

