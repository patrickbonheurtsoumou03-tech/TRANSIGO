import QRCode from 'qrcode';

export interface QRGenerationResult {
  dataUrl: string;
  svgString: string;
  targetUrl: string;
}

export async function generateVehicleQR(vehicleId: string): Promise<QRGenerationResult> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://transigo.cg';
  const targetUrl = `${origin}/#vehicule?id=${encodeURIComponent(vehicleId)}`;

  const dataUrl = await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#006948',
      light: '#ffffff',
    },
    width: 320,
  });

  const svgString = await QRCode.toString(targetUrl, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#006948',
      light: '#ffffff',
    },
  });

  return { dataUrl, svgString, targetUrl };
}

export function downloadQRCode(dataUrl: string, filename: string = 'TRANSIGO-QR.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export const downloadQRCodePNG = downloadQRCode;

export function printQRCodeSticker(vehicleId: string, plate: string, dataUrl: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Macaron Officiel TRANSIGO - ${vehicleId}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 30px;
            color: #1c1917;
          }
          .macaron {
            border: 4px solid #006948;
            border-radius: 24px;
            padding: 24px;
            max-width: 420px;
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }
          .brand {
            font-size: 28px;
            font-weight: 900;
            color: #006948;
            letter-spacing: -0.5px;
          }
          .subtitle {
            font-size: 11px;
            font-weight: 700;
            color: #78716c;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 4px;
          }
          .qr-container {
            margin: 20px auto;
            display: inline-block;
          }
          .qr-container img {
            width: 260px;
            height: 260px;
            display: block;
          }
          .vehicle-id {
            font-size: 26px;
            font-weight: 900;
            font-family: monospace;
            color: #006948;
          }
          .plate {
            font-size: 16px;
            font-weight: 700;
            color: #44403c;
            margin-top: 2px;
          }
          .instruction {
            font-size: 13px;
            color: #57534e;
            margin-top: 16px;
            line-height: 1.4;
          }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px dashed #d6d3d1;
            font-size: 10px;
            color: #a8a29e;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="macaron">
          <div class="brand">TRANSIGO</div>
          <div class="subtitle">Brazzaville Mobility OS • République du Congo</div>
          
          <div class="qr-container">
            <img src="${dataUrl}" alt="QR ${vehicleId}" />
          </div>

          <div class="vehicle-id">${vehicleId}</div>
          <div class="plate">${plate}</div>

          <div class="instruction">
            Scannez ce QR Code avec l'application <strong>TRANSIGO</strong> pour consulter la fiche de sécurité et valider votre titre de transport urbain.
          </div>

          <div class="footer">
            Autorité Organisatrice de la Mobilité Urbaine • Arrêté Préfectoral Brazzaville
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

export const printQRCodePoster = (vehicleId: string, dataUrl: string) => {
  printQRCodeSticker(vehicleId, '', dataUrl);
};
