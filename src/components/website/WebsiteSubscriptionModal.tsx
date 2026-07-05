'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, CheckCircle2, AlertCircle, Loader2, Globe, Sparkles, Shield } from 'lucide-react';

interface Props {
  businessId: string;
  onSuccess: () => void;
  onClose: () => void;
}

type Step = 'info' | 'connecting' | 'confirm' | 'sending' | 'success' | 'error';

const WALLET = process.env.NEXT_PUBLIC_WEBSITE_BUILDER_WALLET!;
const PRICE = parseFloat(process.env.NEXT_PUBLIC_WEBSITE_BUILDER_PRICE_USDC || '1');
const USDC_CONTRACT = process.env.NEXT_PUBLIC_USDC_CONTRACT_POLYGON!;
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID || '137');

// USDC has 6 decimals
const USDC_DECIMALS = 6;

function encodeUSDCTransfer(to: string, amount: number): string {
  const methodId = '0xa9059cbb';
  const rawAmount = BigInt(Math.round(amount * 10 ** USDC_DECIMALS));
  const toClean = to.toLowerCase().replace('0x', '').padStart(64, '0');
  const amountHex = rawAmount.toString(16).padStart(64, '0');
  return methodId + toClean + amountHex;
}

export function WebsiteSubscriptionModal({ businessId, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<Step>('info');
  const [txHash, setTxHash] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.body;
    setMounted(true);
  }, []);

  const handlePay = async () => {
    const eth = (window as unknown as { ethereum?: unknown }).ethereum as {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    } | undefined;

    if (!eth) {
      setErrorMsg('MetaMask not found. Please install MetaMask to pay with USDC.');
      setStep('error');
      return;
    }

    setStep('connecting');
    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[];
      const from = accounts[0];
      setWalletAddress(from);

      // Switch to Polygon
      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x' + CHAIN_ID.toString(16) }] });
      } catch (switchErr: unknown) {
        const err = switchErr as { code?: number };
        if (err.code === 4902) {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x' + CHAIN_ID.toString(16),
              chainName: 'Polygon Mainnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://polygon-rpc.com'],
              blockExplorerUrls: ['https://polygonscan.com'],
            }],
          });
        }
      }

      setStep('confirm');

      const data = encodeUSDCTransfer(WALLET, PRICE);
      setStep('sending');

      const hash = await eth.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: USDC_CONTRACT, data, gas: '0x186A0' }],
      }) as string;

      setTxHash(hash);

      // Record in DB
      await fetch('/api/website/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, txHash: hash, walletAddress: from }),
      });

      setStep('success');
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      if (e.code === 4001) {
        setErrorMsg('Transaction cancelled.');
      } else {
        setErrorMsg(e.message || 'Transaction failed. Please try again.');
      }
      setStep('error');
    }
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #072b2e 0%, #0d5257 100%)' }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-white">Website Builder</h2>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Monthly subscription · Polygon Network</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* INFO STEP */}
            {step === 'info' && (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.15)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>Monthly Subscription</span>
                    <span className="text-[20px] font-bold" style={{ color: '#0d7377' }}>{PRICE} USDC</span>
                  </div>
                  <div className="space-y-2">
                    {['3 professional website templates', 'Full content & brand editor', 'AI voice widget embedded', 'Published at your custom URL', 'Renew anytime — cancel anytime'].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-2)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0d7377' }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] mb-5" style={{ color: 'var(--text-3)' }}>
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0d7377' }} />
                  Payment via MetaMask · {PRICE} USDC on Polygon · Gas ~$0.01
                </div>

                <button
                  onClick={handlePay}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #0d7377, #0a4a4d)' }}
                >
                  <Wallet className="w-4 h-4" />
                  Pay {PRICE} USDC with MetaMask
                </button>
              </motion.div>
            )}

            {/* CONNECTING */}
            {(step === 'connecting' || step === 'confirm' || step === 'sending') && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#0d7377' }} />
                <div className="text-center">
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-1)' }}>
                    {step === 'connecting' ? 'Connecting wallet…' : step === 'confirm' ? 'Confirm in MetaMask…' : 'Broadcasting transaction…'}
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
                    {step === 'sending' ? 'Do not close this window' : 'Please approve in MetaMask'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* SUCCESS */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(5,150,105,0.10)' }}>
                  <Sparkles className="w-7 h-7" style={{ color: '#059669' }} />
                </div>
                <div>
                  <p className="text-[16px] font-bold" style={{ color: 'var(--text-1)' }}>Subscription Active!</p>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>Your website builder is unlocked for 30 days</p>
                </div>
                {txHash && (
                  <p className="text-[10px] font-mono px-3 py-1.5 rounded-lg" style={{ background: 'rgba(13,115,119,0.06)', color: '#0d7377' }}>
                    Tx: {txHash.slice(0, 12)}…{txHash.slice(-8)}
                  </p>
                )}
                <button
                  onClick={onSuccess}
                  className="mt-2 px-8 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #0d7377, #0a4a4d)' }}
                >
                  Start Building
                </button>
              </motion.div>
            )}

            {/* ERROR */}
            {step === 'error' && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <AlertCircle className="w-7 h-7" style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-1)' }}>Payment Failed</p>
                  <p className="text-[12px] mt-1 max-w-xs" style={{ color: 'var(--text-3)' }}>{errorMsg}</p>
                </div>
                <button onClick={() => setStep('info')} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: 'rgba(13,115,119,0.08)', color: '#0d7377' }}>
                  Try Again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  if (!mounted || !portalRef.current) return null;
  return createPortal(modalContent, portalRef.current);
}
