'use client';
import React, { useState } from 'react';

export default function LessonVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(34);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([
    'て ပုံစံက ကြိယာ အဆုံးသတ်ကို ပြောင်းပြီး ဖွဲ့တယ်',
    'အုပ်စု ၁ — く→いて、ぐ→いで、す→して',
  ]);

  const handleSaveNote = () => {
    if (noteText.trim()) {
      setSavedNotes((prev) => [...prev, noteText.trim()]);
      setNoteText('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Video Area */}
      <div className="relative bg-gray-950 aspect-video flex items-center justify-center group">
        {/* Thumbnail / Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-[#003d1f] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-3 opacity-60">🎬</div>
            <p className="text-gray-400 text-sm">て ပုံစံ ဆက်စပ်အသုံး — သင်ခန်းစာ ၇</p>
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="relative z-10 w-16 h-16 rounded-full bg-[#006633] hover:bg-[#005528] text-white flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'ရပ်ရန်' : 'ဖွင့်ရန်'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-mono">
          6:12 / 18:00
        </div>

        {/* CC badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-semibold">
          CC
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative h-1.5 bg-muted rounded-full cursor-pointer group/bar">
          <div
            className="h-full bg-[#006633] rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#006633] rounded-full border-2 border-white shadow opacity-0 group-hover/bar:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="ဖွင့်/ရပ်"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="၁၀ စက္ကန့် နောက်ပြန်"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
              />
            </svg>
          </button>
          <span className="text-xs text-muted-foreground font-mono">6:12 / 18:00</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <div className="w-16 h-1 bg-muted rounded-full">
              <div className="w-3/4 h-full bg-muted-foreground rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-xs bg-muted text-muted-foreground border border-border rounded px-2 py-1 cursor-pointer">
            <option>1x</option>
            <option>1.25x</option>
            <option>1.5x</option>
            <option>2x</option>
          </select>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-medium ${
              showNotes
                ? 'bg-[#006633]/10 text-[#006633] border-[#006633]/30'
                : 'bg-muted text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            📝 မှတ်စု
          </button>
        </div>
      </div>

      {/* Notes Panel */}
      {showNotes && (
        <div className="border-t border-border px-4 py-4 bg-muted/30">
          <h4 className="text-sm font-semibold text-foreground mb-3">ကျွန်ုပ်၏ မှတ်စုများ</h4>
          {savedNotes.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {savedNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-[#006633] mt-0.5 flex-shrink-0">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
              placeholder="ဒီအချိန်အတွက် မှတ်စု ရေးပါ..."
              className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#006633]/30 focus:border-[#006633]"
            />
            <button
              onClick={handleSaveNote}
              className="px-3 py-2 bg-[#006633] text-white text-sm font-medium rounded-lg hover:bg-[#005528] transition-colors"
            >
              သိမ်းမယ်
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
