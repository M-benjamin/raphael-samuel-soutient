'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Wallet, Loader2, CheckCircle2, ExternalLink, AlertCircle,
  Copy, CreditCard,
} from 'lucide-react';
import type { Appointment, PaymentConfig } from '@/types';

interface Props {
  appointment: Appointment & { service?: { name: string; price_min?: number | null; price_max?: number | null; price_type?: string } };
  businessId: string;
  onClose: () => void;
  onPaid: (txHash: string, amountPaid: number, method: string) => void;
}

type Step = 'choose' | 'usdc-loading' | 'usdc-connect' | 'usdc-review' | 'sending' | 'success' | 'error';
type PayMethod = 'full-usdc' | 'partial-usdc';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

function encodeTransfer(to: string, amount: bigint): string {
  const selector = 'a9059cbb';
  const paddedTo = to.toLowerCase().replace('0x', '').padStart(64, '0');
  const paddedAmount = amount.toString(16).padStart(64, '0');
  return '0x' + selector + paddedTo + paddedAmount;
}
function toHex(n: number) { return '0x' + n.toString(16); }

export function PaymentModal({ appointment, businessId, onClose, onPaid }: Props) {
  const [step, setStep] = useState<Step>('choose');
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [account, setAccount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const svc = appointment.service;
  const alreadyPaid = Number(appointment.amount_paid ?? 0);

  // Derive the service price based on price_type
  const resolveServicePrice = (): number | null => {
    if (!svc) return null;
    if (svc.price_type === 'call_for_price') return null; // patient enters custom amount
    // fixed / range / starting_at — use price_min as the base payable amount
    return svc.price_min ?? null;
  };

  // Use appointment.amount_remaining if already calculated by the server,
  // otherwise fall back to (servicePrice - alreadyPaid)
  const servicePrice = resolveServicePrice();
  const displayTotal = servicePrice ?? 0;
  const remaining = Number(appointment.amount_remaining ?? 0) > 0
    ? Number(appointment.amount_remaining)
    : displayTotal > 0 ? Math.max(0, displayTotal - alreadyPaid) : 0;

  // True when price is unknown (call_for_price) — patient must type an amount
  const isCustomPrice = svc?.price_type === 'call_for_price' || servicePrice === null;

  const loadConfig = (m: PayMethod) => {
    setMethod(m);
    setStep('usdc-loading');
    fetch(`/api/portal/payment-config?businessId=${businessId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErrorMsg(data.error); setStep('error'); return; }
        setConfig(data as PaymentConfig);
        // For full-usdc with a known price, pre-fill the amount; otherwise leave blank for user input
        if (m === 'full-usdc' && !isCustomPrice) {
          setUsdcAmount(String(remaining > 0 ? remaining : displayTotal));
        } else {
          setUsdcAmount('');
        }
        setStep('usdc-connect');
      })
      .catch(() => { setErrorMsg('Failed to load payment configuration'); setStep('error'); });
  };

  const connectWallet = async () => {
    if (!window.ethereum) { setErrorMsg('No wallet detected. Please install MetaMask.'); setStep('error'); return; }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      setAccount(accounts[0]);
      if (config) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: toHex(config.chain_id) }] });
        } catch (e: unknown) {
          if ((e as { code?: number }).code === 4902) {
            await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: toHex(config.chain_id), chainName: config.network_name, rpcUrls: [config.rpc_url], nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 } }] });
          }
        }
      }
      setStep('usdc-review');
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Wallet connection failed'); setStep('error'); }
  };

  const sendUsdc = async () => {
    if (!config || !account || !usdcAmount) return;
    const amt = parseFloat(usdcAmount);
    if (isNaN(amt) || amt <= 0) return;
    setStep('sending');
    try {
      const raw = BigInt(Math.round(amt * 10 ** config.usdc_decimals));
      const data = encodeTransfer(config.receiver_wallet, raw);
      const hash = await window.ethereum!.request({ method: 'eth_sendTransaction', params: [{ from: account, to: config.usdc_contract_address, data, gas: toHex(80000) }] }) as string;
      setTxHash(hash);
      const isPartial = method === 'partial-usdc';
      await fetch('/api/portal/record-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id, txHash: hash, amount: amt, method: isPartial ? 'partial' : 'usdc', totalAmount: displayTotal }),
      });
      setStep('success');
      onPaid(hash, amt, isPartial ? 'partial' : 'usdc');
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Transaction failed'); setStep('error'); }
  };

  const explorerUrl = txHash && config ? `https://polygonscan.com/tx/${txHash}` : '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-[420px] rounded-2xl overflow-hidden"
          style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', border: '1px solid rgba(13,115,119,0.12)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(13,115,119,0.10)', background: 'linear-gradient(135deg,rgba(20,168,181,0.06),rgba(13,115,119,0.04))' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#14a8b5,#0d7377)' }}>
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-[14px]" style={{ color: '#0a2e30' }}>Pay with USDC</p>
                <p className="text-[11px]" style={{ color: '#64748b' }}>{svc?.name || 'Appointment'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: '#94a3b8', background: '#f1f5f9' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Price banner */}
          {displayTotal > 0 && !isCustomPrice && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.12)' }}>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Service Total</p>
                <p className="text-[20px] font-bold" style={{ color: '#0a2e30' }}>${displayTotal.toFixed(2)}</p>
              </div>
              {alreadyPaid > 0 && (
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>Remaining</p>
                  <p className="text-[18px] font-bold" style={{ color: '#c8102e' }}>${remaining.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-5">

            {/* Step: choose */}
            {step === 'choose' && (
              <div className="space-y-3">
                <p className="text-[13px] font-semibold mb-1" style={{ color: '#334155' }}>How much would you like to pay now?</p>

                <button onClick={() => loadConfig('full-usdc')}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(13,115,119,0.06)', border: '1.5px solid rgba(13,115,119,0.20)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(13,115,119,0.12)' }}>
                    <Wallet className="w-5 h-5" style={{ color: '#0d7377' }} />
                  </div>
                  <div>
                    <p className="font-bold text-[14px]" style={{ color: '#0a2e30' }}>
                      Pay {remaining > 0 ? 'Remaining' : 'Full'} Amount
                      {!isCustomPrice && (remaining > 0 ? remaining : displayTotal) > 0 && (
                        <span className="ml-2 text-[13px] font-semibold" style={{ color: '#0d7377' }}>
                          ${(remaining > 0 ? remaining : displayTotal).toFixed(2)}
                        </span>
                      )}
                      {isCustomPrice && (
                        <span className="ml-2 text-[12px] font-normal" style={{ color: '#64748b' }}>Enter amount</span>
                      )}
                    </p>
                    <p className="text-[12px]" style={{ color: '#64748b' }}>Pay the full balance via crypto wallet</p>
                  </div>
                </button>

                <button onClick={() => loadConfig('partial-usdc')}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(99,102,241,0.05)', border: '1.5px solid rgba(99,102,241,0.18)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.10)' }}>
                    <CreditCard className="w-5 h-5" style={{ color: '#6366f1' }} />
                  </div>
                  <div>
                    <p className="font-bold text-[14px]" style={{ color: '#0a2e30' }}>Pay a Partial Amount</p>
                    <p className="text-[12px]" style={{ color: '#64748b' }}>Pay any USDC amount now — remainder settled later</p>
                  </div>
                </button>

                <p className="text-center text-[11px] pt-1" style={{ color: '#94a3b8' }}>
                  Cash payments are recorded by the clinic — contact your doctor.
                </p>
              </div>
            )}

            {/* Step: loading config */}
            {step === 'usdc-loading' && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0d7377' }} />
                <p className="text-[13px]" style={{ color: '#64748b' }}>Loading payment configuration…</p>
              </div>
            )}

            {/* Step: connect wallet */}
            {step === 'usdc-connect' && (
              <div className="space-y-4">
                <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.14)' }}>
                  <p className="text-[12px] font-semibold" style={{ color: '#0d7377' }}>Payment Info</p>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <span style={{ color: '#64748b' }}>Network</span><span className="font-medium" style={{ color: '#0a2e30' }}>{config?.network_name}</span>
                    <span style={{ color: '#64748b' }}>Token</span><span className="font-medium" style={{ color: '#0a2e30' }}>USDC</span>
                    <span style={{ color: '#64748b' }}>Receiver</span>
                    <span className="font-mono text-[10px] truncate" style={{ color: '#0a2e30' }}>{config?.receiver_wallet.slice(0, 10)}…{config?.receiver_wallet.slice(-6)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('choose')} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: '#f1f5f9', color: '#64748b' }}>Back</button>
                  <button onClick={connectWallet} className="flex-1 py-3 rounded-xl font-bold text-white text-[14px] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#14a8b5,#0d7377)' }}>
                    <Wallet className="w-4 h-4" /> Connect Wallet
                  </button>
                </div>
              </div>
            )}

            {/* Step: review amount */}
            {step === 'usdc-review' && (
              <div className="space-y-4">
                <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.20)' }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} />
                  <p className="text-[12px] font-medium truncate" style={{ color: '#059669' }}>Connected: {account.slice(0, 8)}…{account.slice(-6)}</p>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                    {method === 'partial-usdc' ? 'Amount to Pay Now (USDC)' : isCustomPrice ? 'Enter Amount (USDC)' : 'Amount (USDC)'}
                  </label>
                  {isCustomPrice && (
                    <p className="text-[11px] mb-2" style={{ color: '#64748b' }}>Price is set by the clinic — enter the amount agreed with your doctor.</p>
                  )}
                  <input
                    type="number" min="0.01" step="0.01" value={usdcAmount}
                    onChange={e => setUsdcAmount(e.target.value)} placeholder="0.00"
                    readOnly={method === 'full-usdc' && !isCustomPrice}
                    className="w-full px-4 py-3 rounded-xl text-[22px] font-bold outline-none text-center"
                    style={{ background: (method === 'full-usdc' && !isCustomPrice) ? 'rgba(13,115,119,0.04)' : '#f8fafc', border: '1.5px solid #e2e8f0', color: '#0a2e30' }}
                    onFocus={e => { if (method !== 'full-usdc' || isCustomPrice) e.currentTarget.style.borderColor = '#0d7377'; }}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  />
                  {method === 'partial-usdc' && displayTotal > 0 && parseFloat(usdcAmount) > 0 && parseFloat(usdcAmount) < displayTotal && (
                    <p className="text-center text-[11px] mt-1.5 font-medium" style={{ color: '#6366f1' }}>
                      ${(displayTotal - alreadyPaid - parseFloat(usdcAmount)).toFixed(2)} remaining — doctor will record any cash balance
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('usdc-connect')} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: '#f1f5f9', color: '#64748b' }}>Back</button>
                  <button onClick={sendUsdc} disabled={!usdcAmount || parseFloat(usdcAmount) <= 0}
                    className="flex-1 py-3 rounded-xl font-bold text-white text-[14px] flex items-center justify-center gap-2 transition-opacity"
                    style={{ background: 'linear-gradient(135deg,#14a8b5,#0d7377)', opacity: (!usdcAmount || parseFloat(usdcAmount) <= 0) ? 0.5 : 1 }}>
                    Send {usdcAmount || '0'} USDC
                  </button>
                </div>
              </div>
            )}

            {/* Sending */}
            {step === 'sending' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.10)', border: '2px solid rgba(13,115,119,0.20)' }}>
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#0d7377' }} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-[15px]" style={{ color: '#0a2e30' }}>Sending transaction…</p>
                  <p className="text-[12px] mt-1" style={{ color: '#64748b' }}>Confirm in your wallet — do not close this window</p>
                </div>
              </div>
            )}

            {/* Success */}
            {step === 'success' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 18, stiffness: 300 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(5,150,105,0.12)', border: '2px solid rgba(5,150,105,0.30)' }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: '#059669' }} />
                </motion.div>
                <div className="text-center">
                  <p className="font-bold text-[16px]" style={{ color: '#0a2e30' }}>Payment Submitted!</p>
                  <p className="text-[12px] mt-1" style={{ color: '#64748b' }}>Your USDC payment has been sent successfully.</p>
                </div>
                {txHash && (
                  <div className="w-full rounded-xl p-3 space-y-2" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <p className="text-[11px] font-semibold" style={{ color: '#64748b' }}>Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] flex-1 truncate" style={{ color: '#0a2e30' }}>{txHash}</code>
                      <button onClick={() => { navigator.clipboard.writeText(txHash); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1 rounded" style={{ color: '#64748b' }}>
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 w-full">
                  {explorerUrl && (
                    <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5"
                      style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377', border: '1px solid rgba(13,115,119,0.15)' }}>
                      <ExternalLink className="w-3.5 h-3.5" /> View on Explorer
                    </a>
                  )}
                  <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#14a8b5,#0d7377)' }}>Done</button>
                </div>
              </div>
            )}

            {/* Error */}
            {step === 'error' && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.10)', border: '2px solid rgba(239,68,68,0.25)' }}>
                  <AlertCircle className="w-7 h-7" style={{ color: '#dc2626' }} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-[15px]" style={{ color: '#0a2e30' }}>Something went wrong</p>
                  <p className="text-[12px] mt-1 max-w-[280px] leading-relaxed" style={{ color: '#64748b' }}>{errorMsg}</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setStep('choose')} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: '#f1f5f9', color: '#64748b' }}>Try Again</button>
                  <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: '#f1f5f9', color: '#374151' }}>Close</button>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
