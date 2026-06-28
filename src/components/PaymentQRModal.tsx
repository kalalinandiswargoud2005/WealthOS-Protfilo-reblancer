import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { X, QrCode, Camera, Copy, CheckCircle, ArrowDownToLine, ScanLine, Wallet, Share2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  open: boolean;
  onClose: () => void;
}

const UPI_ID = 'wealthos@okaxis';
const PORTFOLIO_NAME = 'WealthOS Portfolio';

const PaymentQRModal: React.FC<Props> = ({ open, onClose }) => {
  const { cashBalance, depositCash } = usePortfolio();
  const [tab, setTab] = useState<'receive' | 'scan'>('receive');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanSuccess, setScanSuccess] = useState('');
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'html5-qrcode-scanner';

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PORTFOLIO_NAME)}${amount ? `&am=${amount}` : ''}&cu=INR`;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('payment-qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `WealthOS_Payment_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setScanSuccess('✓ QR code downloaded successfully!');
    setTimeout(() => setScanSuccess(''), 3000);
  };

  const shareQR = async () => {
    const canvas = document.getElementById('payment-qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'WealthOS_QR.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'WealthOS QR Code',
            text: `Transfer funds to WealthOS Portfolio using UPI.`
          });
        } catch (err) {
          console.log('Web share failed', err);
        }
      } else {
        // Fallback: Copy UPI link to clipboard
        navigator.clipboard.writeText(upiUrl);
        setCopied(true);
        setScanSuccess('✓ Share link copied to clipboard!');
        setTimeout(() => { setCopied(false); setScanSuccess(''); }, 2000);
      }
    }, 'image/png');
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (_) { /* ignore */ }
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  const startScanner = async () => {
    setScanError('');
    setScanResult('');
    setScanSuccess('');
    setScannerActive(true);

    await new Promise(r => setTimeout(r, 200)); // let DOM render

    try {
      const scanner = new Html5Qrcode(scannerDivId);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error('No cameras found on your device.');
      }
      // Try to find a back camera, otherwise use the first available (useful for laptops)
      const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
      const cameraId = backCamera ? backCamera.id : cameras[0].id;

      await scanner.start(
        cameraId,
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (decodedText: string) => {
          setScanResult(decodedText);
          stopScanner();

          // Parse UPI URL
          try {
            const url = new URL(decodedText.replace('upi://', 'http://'));
            const am = url.searchParams.get('am') || url.searchParams.get('Am');
            const pn = url.searchParams.get('pn') || url.searchParams.get('Pn') || 'Unknown';

            if (am && parseFloat(am) > 0) {
              const depositAmt = parseFloat(am);
              depositCash(depositAmt);
              setScanSuccess(`✓ ₹${depositAmt.toLocaleString('en-IN')} received from "${pn}" and added to your cash balance!`);
            } else {
              // Generic QR — treat as ₹100 demo deposit
              depositCash(100);
              setScanSuccess('✓ QR scanned! ₹100 demo credit added to cash balance.');
            }
          } catch {
            depositCash(500);
            setScanSuccess('✓ Payment QR scanned! ₹500 demo credit added to cash balance.');
          }
        },
        () => { /* ignore scan errors */ }
      );
    } catch (err: unknown) {
      setScannerActive(false);
      const message = err instanceof Error ? err.message : String(err);
      setScanError(`Camera access denied or unavailable. ${message.includes('Permission') ? 'Please allow camera access.' : 'Try uploading a QR image instead.'}`);
    }
  };

  useEffect(() => {
    if (!open) { stopScanner(); }
  }, [open]);

  useEffect(() => {
    if (tab !== 'scan') stopScanner();
  }, [tab]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-[#0D0D0F] border border-[#27272A] rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272A]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Pay / Receive Money</h2>
                <p className="text-[11px] text-zinc-500">UPI QR — Instant Transfer</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>

          {/* Cash Balance */}
          <div className="mx-5 mt-4 rounded-lg bg-[#141413] border border-[#27272A] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Wallet className="w-3.5 h-3.5" />
              Cash Balance
            </div>
            <span className="text-sm font-bold text-emerald-400">₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>

          {/* Tabs */}
          <div className="flex mx-5 mt-4 rounded-lg bg-[#141413] border border-[#27272A] p-1">
            <button
              onClick={() => setTab('receive')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${tab === 'receive' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> Receive Money
            </button>
            <button
              onClick={() => setTab('scan')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${tab === 'scan' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              <ScanLine className="w-3.5 h-3.5" /> Scan & Pay
            </button>
          </div>

          <div className="px-5 py-5">
            {tab === 'receive' ? (
              <div className="flex flex-col items-center gap-4">
                {/* QR Code */}
                <div className="rounded-2xl bg-[#141413] border border-[#27272A] p-5 flex flex-col items-center gap-3 w-full">
                  <div className="bg-[#141413] p-3 rounded-xl border border-[#27272A]/40">
                    <QRCodeCanvas
                      id="payment-qr-canvas"
                      value={upiUrl}
                      size={200}
                      fgColor="#f59e0b"
                      bgColor="#141413"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  
                  {/* Download & Share Actions */}
                  <div className="flex gap-2 w-full pt-1">
                    <button
                      onClick={downloadQR}
                      className="flex-1 py-2 px-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-bold hover:bg-amber-500/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" /> Download QR
                    </button>
                    <button
                      onClick={shareQR}
                      className="flex-1 py-2 px-3 rounded-xl border border-zinc-700 bg-white/5 text-zinc-300 text-xs font-bold hover:bg-white/10 hover:border-zinc-500 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share QR
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div className="w-full">
                  <label className="block text-[11px] text-zinc-500 mb-1.5 uppercase tracking-wider font-medium">Specify Amount (optional)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Leave blank for open amount"
                    className="w-full bg-[#141413] border border-[#27272A] rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/50 placeholder:text-zinc-600"
                  />
                </div>

                {/* Quick amounts */}
                <div className="w-full grid grid-cols-4 gap-2">
                  {[500, 1000, 5000, 10000].map(amt => (
                    <button key={amt} onClick={() => setAmount(String(amt))}
                      className="py-1.5 rounded-lg bg-[#141413] border border-[#27272A] text-[11px] text-zinc-400 hover:border-amber-500/40 hover:text-amber-400 transition-all">
                      ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>

                {/* UPI ID */}
                <div className="w-full flex items-center justify-between bg-[#141413] border border-[#27272A] rounded-lg px-4 py-2.5">
                  <div>
                    <div className="text-[10px] text-zinc-500">UPI ID</div>
                    <div className="text-sm font-mono font-semibold text-white">{UPI_ID}</div>
                  </div>
                  <button onClick={copyUPI} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400 transition-colors">
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-600 text-center">
                  Share this QR or UPI ID with anyone to receive money directly into your WealthOS portfolio cash balance.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Scanner area */}
                <div className="w-full rounded-xl bg-[#141413] border border-[#27272A] overflow-hidden" style={{ minHeight: '280px' }}>
                  {!scannerActive && !scanResult ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-amber-400" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white mb-1">Scan a UPI QR Code</div>
                        <div className="text-xs text-zinc-500">Point camera at any UPI QR to deposit funds</div>
                      </div>
                      <button
                        onClick={startScanner}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-all hover:scale-[1.02]"
                      >
                        <Camera className="w-4 h-4" /> Open Camera Scanner
                      </button>
                      {scanError && (
                        <div className="mx-4 text-xs text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                          {scanError}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Scanner div — always rendered when tab=scan to keep DOM ready */}
                  <div
                    id={scannerDivId}
                    className={scannerActive ? 'block' : 'hidden'}
                    style={{ width: '100%' }}
                  />
                </div>

                {scannerActive && (
                  <button onClick={stopScanner} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" /> Stop Scanner
                  </button>
                )}

                {scanSuccess && (
                  <div className="w-full rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400 font-medium text-center animate-fade-in-up">
                    {scanSuccess}
                  </div>
                )}

                {scanResult && !scanSuccess && (
                  <div className="w-full rounded-lg bg-[#141413] border border-[#27272A] p-3">
                    <div className="text-[10px] text-zinc-500 mb-1">Scanned Data</div>
                    <div className="text-xs font-mono text-zinc-300 break-all">{scanResult}</div>
                  </div>
                )}

                <div className="text-[11px] text-zinc-600 text-center">
                  Scanning a UPI QR code will parse the payment amount and auto-deposit it into your portfolio cash balance.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default PaymentQRModal;
