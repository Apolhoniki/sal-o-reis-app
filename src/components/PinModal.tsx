import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, ShieldCheck, KeyRound } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setErrorMsg('');
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    // Only numeric input
    if (value && !/^\d+$/.test(value)) return;

    const newPin = [...pin];
    // Take last entered character if multiple typed
    const char = value.slice(-1);
    newPin[index] = char;
    setPin(newPin);
    setErrorMsg('');

    // Auto focus next box if digit entered
    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto verify when 4 digits completed
    if (char && index === 3) {
      const fullPin = newPin.join('');
      verifyPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === '0703') {
      onSuccess();
    } else {
      setErrorMsg('PIN incorreto. Tente novamente.');
      setPin(['', '', '', '']);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin.join(''));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#121212] border border-[#D4AF37]/60 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(212,175,55,0.25)] text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-[#1A1A1A] border border-[#2A2A2A] transition-all"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-full bg-[#1A1A1A] border border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)] mb-4">
          <KeyRound className="w-7 h-7 text-[#D4AF37]" />
        </div>

        <div className="text-center mb-5">
          <h3 className="font-cinzel text-lg font-bold text-[#D4AF37] tracking-wider uppercase">
            Acesso Restrito Adson
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Digite o PIN numérico de 4 dígitos para desbloquear o painel administrativo.
          </p>
        </div>

        {/* PIN Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 rounded-2xl bg-[#1A1A1A] border text-center font-extrabold text-xl text-[#D4AF37] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all shadow-inner ${
                  errorMsg ? 'border-rose-500 text-rose-400' : 'border-[#2A2A2A]'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 text-center font-semibold animate-pulse">
              {errorMsg}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Desbloquear Painel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
