'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Copy, ExternalLink, Heart, Feather } from 'lucide-react';
import { saveLocalStorageStory } from '@/lib/supabase';
import type { StoryTheme, CreateStoryResponse } from '@/types/story';

export interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { id: StoryTheme; label: string; sub: string; emoji: string }[] = [
  { id: 'sakura', label: 'Sakura Night', sub: 'Classic midnight & drifting blossoms', emoji: '🌸' },
  { id: 'rain', label: 'Tokyo Rain', sub: 'Moody blues & neon reflections', emoji: '🌧️' },
  { id: 'dawn', label: 'Golden Dawn', sub: 'Warm sunrise starlight & amber glow', emoji: '🌅' },
];

export function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [promiseText, setPromiseText] = useState('');
  const [dateMoment, setDateMoment] = useState('');
  const [theme, setTheme] = useState<StoryTheme>('sakura');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<CreateStoryResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const defaultDateMoment =
    new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' • 24:00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!senderName.trim()) {
      setErrorMsg('Please enter your name or alias.');
      return;
    }
    if (!recipientName.trim()) {
      setErrorMsg('Please enter the recipient’s name.');
      return;
    }
    if (!promiseText.trim() || promiseText.trim().length < 3) {
      setErrorMsg('Please write your promise (at least 3 characters).');
      return;
    }

    setIsLoading(true);

    try {
      const moment = dateMoment.trim() || defaultDateMoment;

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: senderName.trim(),
          recipient_name: recipientName.trim(),
          promise_text: promiseText.trim(),
          date_moment: moment,
          theme,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to craft story');
      }

      // Guarantee immediate storage in client localStorage for 100% offline & local dev resilience
      if (data.story) {
        saveLocalStorageStory(data.story);
      }

      setCreatedResult(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdResult?.url) return;
    try {
      await navigator.clipboard.writeText(createdResult.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const resetForm = () => {
    setSenderName('');
    setRecipientName('');
    setPromiseText('');
    setDateMoment('');
    setTheme('sakura');
    setCreatedResult(null);
    setErrorMsg(null);
    setCopied(false);
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Craft a Rooftop Story"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#0a0e24] shadow-[0_0_60px_rgba(255,133,162,0.15)] text-white p-6 sm:p-8 select-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            resetForm();
            onClose();
          }}
          aria-label="Close modal"
          className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!createdResult ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-pink-400/30 bg-pink-500/10 text-[10px] font-mono tracking-widest text-pink-300 uppercase mb-3">
                <Feather className="w-3 h-3 text-pink-300" />
                <span>ROOFTOP MEMOIR CREATOR</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Craft a Rooftop Story
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/70 font-light mt-1">
                Seal a personal letter into the Tokyo night. Your recipient will break the wax seal to unveil your words against the 3D skyline.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Sender & Recipient Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider text-indigo-200/80 uppercase mb-1.5">
                    Your Name (Sender)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Ren"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#121633] text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-colors placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider text-indigo-200/80 uppercase mb-1.5">
                    For (Recipient)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Aoi"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#121633] text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-colors placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Optional Date / Moment Tag */}
              <div>
                <label className="block text-xs font-mono tracking-wider text-indigo-200/80 uppercase mb-1.5">
                  Date / Moment Tag (Optional)
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={dateMoment}
                  onChange={(e) => setDateMoment(e.target.value)}
                  placeholder={`e.g. ${defaultDateMoment}`}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#121633] text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-colors placeholder:text-white/20"
                />
              </div>

              {/* Promise Textarea */}
              <div>
                <label className="block text-xs font-mono tracking-wider text-indigo-200/80 uppercase mb-1.5">
                  Your Promise / Message
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={1500}
                  value={promiseText}
                  onChange={(e) => setPromiseText(e.target.value)}
                  placeholder="Write your midnight whisper or heartfelt promise..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#121633] text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-colors placeholder:text-white/20 resize-none"
                />
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-mono tracking-wider text-indigo-200/80 uppercase mb-2">
                  Atmospheric Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        theme === opt.id
                          ? 'border-pink-400 bg-pink-500/15 shadow-[0_0_15px_rgba(255,133,162,0.2)]'
                          : 'border-white/10 bg-[#121633]/60 hover:bg-[#121633] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{opt.emoji}</span>
                        <span className="text-xs font-bold tracking-wide">{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-indigo-200/60 mt-1 font-light leading-snug">
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <span className="block text-[11px] font-mono tracking-widest text-indigo-300/60 uppercase mb-2">
                  Live Card Preview
                </span>
                <div
                  className="p-5 rounded-2xl border border-white/10 bg-[#15193d]/80 backdrop-blur-md relative overflow-hidden transition-all duration-300"
                  style={{
                    boxShadow:
                      theme === 'rain'
                        ? '0 8px 30px -10px rgba(56, 189, 248, 0.3)'
                        : theme === 'dawn'
                        ? '0 8px 30px -10px rgba(251, 146, 60, 0.3)'
                        : '0 8px 30px -10px rgba(255, 183, 197, 0.3)',
                  }}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2 text-indigo-300/60">
                    <span>{dateMoment || defaultDateMoment}</span>
                    <span className="uppercase text-pink-300/80 font-bold">
                      {theme} THEME
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    約束の言葉 <span className="text-xs font-light text-indigo-200/60">(The Promise)</span>
                  </h4>
                  <p className="text-xs italic text-pink-200/90 leading-relaxed mb-3">
                    &ldquo;{promiseText || 'Write your promise above to preview your letter...'}&rdquo;
                  </p>
                  <div className="text-[10px] font-mono text-indigo-300/70 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span>FOR: {recipientName || 'Recipient'}</span>
                    <span>FROM: {senderName || 'Sender'}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-mono text-xs tracking-widest uppercase font-bold shadow-[0_0_25px_rgba(255,133,162,0.4)] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Sealing into Tokyo Starlight...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Seal & Generate Letter Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-4 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-pink-400 bg-pink-500/20 flex items-center justify-center text-pink-300 shadow-[0_0_30px_rgba(255,133,162,0.4)] animate-bounce">
              <Heart className="w-10 h-10 fill-pink-400 text-pink-400" />
            </div>

            <div>
              <span className="text-xs font-mono tracking-[0.25em] text-pink-300 uppercase block mb-1">
                Letter Sealed • 封印完了
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ready for {createdResult.story.recipient_name}
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100/70 font-light mt-2 max-w-md mx-auto">
                Share this link with them. When they open it, they will break the wax seal to unveil your message in the midnight 3D rooftop.
              </p>
            </div>

            {/* Generated Link Box */}
            <div className="p-4 rounded-2xl border border-white/10 bg-[#121633] flex items-center justify-between gap-3 text-left">
              <input
                type="text"
                readOnly
                value={createdResult.url}
                className="w-full bg-transparent text-xs sm:text-sm font-mono text-pink-300 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-pink-500 text-white text-xs font-mono font-medium hover:bg-pink-600 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={createdResult.url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full border border-pink-400/40 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 text-xs font-mono tracking-wider transition-colors"
              >
                <span>View Letter Directly</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs font-mono tracking-wider transition-colors cursor-pointer"
              >
                Craft Another Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateStoryModal;
