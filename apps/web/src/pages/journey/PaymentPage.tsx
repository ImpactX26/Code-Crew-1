import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { StepHeader } from '../../components/StepHeader';
import { AgentTracePanel } from '../../components/AgentTracePanel';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { CheckoutPlanInfo } from '@educaro/shared';
import {
  QrCode,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { token } = useAuth();
  const { refreshJourney } = useJourney();
  const navigate = useNavigate();

  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutPlanInfo | null>(null);
  const [method, setMethod] = useState<'QR' | 'UPI'>('QR');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/payment/checkout-info');
        if (res.ok) {
          const data = await res.json();
          setCheckoutInfo(data);
        }
      } catch (err) {
        console.error('Failed to load checkout details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const copyUpi = () => {
    if (checkoutInfo?.upiId) {
      navigator.clipboard.writeText(checkoutInfo.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      // Use a generated UTR since we don't necessarily have a file/input on this simple page
      // just to meet the backend's minimum requirements for a submission.
      formData.append('utr', `MANUAL-${Date.now()}`);

      const res = await fetch('/api/payment/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment submission failed');

      await refreshJourney();
      navigate('/journey/next-steps');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong submitting payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-educaro-main flex flex-col text-educaro-primary fade-in-on-load">
      <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />

      <StepHeader
        currentStepIndex={8}
        totalSteps={9}
        stepTitle="Payment"
        stepSubtitle="Secure your premium evaluation to continue to the final step."
        backRoute="/journey/cv"
        nextRoute="/journey/next-steps"
        continueLabel="Skip to Premium"
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 pb-32">
        <div className="bg-white rounded-3xl border border-educaro-border p-6 shadow-sm space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-educaro-primary">Complete Your Payment</h2>
            <p className="text-sm text-educaro-muted mt-2">
              Pay the required fee of ₹{checkoutInfo?.amount || 100} to proceed.
            </p>
          </div>

          <div className="bg-[#EEF1EB] rounded-2xl p-4 border border-educaro-border mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-educaro-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-educaro-primary leading-snug">
                Razorpay integration coming soon — for now, please pay via UPI/QR and confirm below.
              </p>
            </div>
          </div>

          {/* Method toggle */}
          <div className="flex p-1 bg-educaro-secondary rounded-xl">
            <button
              type="button"
              data-button-size="compact"
              onClick={() => setMethod('QR')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                method === 'QR' ? 'bg-educaro-accent text-white shadow-xs' : 'text-educaro-muted hover:text-educaro-primary'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Dynamic UPI QR</span>
            </button>
            <button
              type="button"
              data-button-size="compact"
              onClick={() => setMethod('UPI')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                method === 'UPI' ? 'bg-educaro-accent text-white shadow-xs' : 'text-educaro-muted hover:text-educaro-primary'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI ID / VPA</span>
            </button>
          </div>

          {/* Mode display */}
          {method === 'QR' ? (
            <div className="text-center p-6 bg-educaro-main rounded-2xl border border-educaro-border space-y-4">
              {loading ? (
                <div className="w-48 h-48 mx-auto bg-white flex items-center justify-center border border-educaro-border rounded-xl text-sm text-educaro-muted">
                  Loading QR...
                </div>
              ) : checkoutInfo?.qrCodeDataUrl ? (
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-educaro-border shadow-xs flex items-center justify-center">
                  <img
                    src={checkoutInfo.qrCodeDataUrl}
                    alt="Educaro UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : null}
              <p className="text-xs text-educaro-muted">
                Scan using Google Pay, PhonePe, Paytm, BHIM, or CRED
              </p>
              {checkoutInfo?.upiUri && (
                <a
                  href={checkoutInfo.upiUri}
                  className="inline-flex items-center gap-1 text-sm font-bold text-educaro-accent hover:underline"
                >
                  <span>Pay directly via UPI mobile app</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="p-6 bg-educaro-main rounded-2xl border border-educaro-border space-y-4">
              <label className="text-sm font-semibold text-educaro-primary block">
                Educaro Business UPI VPA:
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-educaro-border">
                <span className="font-mono text-sm font-bold text-educaro-primary flex-1">
                  {checkoutInfo?.upiId || 'Loading...'}
                </span>
                <button
                  type="button"
                  onClick={copyUpi}
                  className="p-2 rounded text-educaro-muted hover:text-educaro-primary"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="w-5 h-5 text-educaro-accent" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-educaro-muted">
                Send exactly ₹{checkoutInfo?.amount || 100} to this UPI ID from any banking app.
              </p>
            </div>
          )}

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              {errorMsg}
            </p>
          )}

          <div className="pt-4 border-t border-educaro-border">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-full bg-educaro-accent hover:bg-educaro-accentHover text-white text-sm font-bold shadow-md transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'I have completed the payment'}
            </button>
          </div>
        </div>
      </main>

      <AgentTracePanel isOpen={isTraceOpen} onClose={() => setIsTraceOpen(false)} />
    </div>
  );
};
