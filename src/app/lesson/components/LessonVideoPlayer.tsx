'use client';
import React, { useEffect, useState } from 'react';
import { LESSON_VIDEOS, type LessonVideo } from '@/data/lessonVideos';

/** Returns the YouTube video id for watch / youtu.be / shorts / embed links, else null. */
function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1) || null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/);
      return m ? m[1] : null;
    }
  } catch {
    // not a URL
  }
  return null;
}

function VideoArea({ video }: { video: LessonVideo }) {
  const url = video.url.trim();
  const ytId = url ? youTubeId(url) : null;

  if (ytId) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  if (url) {
    return (
      <video className="w-full h-full bg-black" controls playsInline preload="metadata" src={url}>
        ဒီ browser က video ကို မဖွင့်နိုင်ပါ။
      </video>
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-[#003d1f] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-5xl mb-3 opacity-70">🎬</div>
        <p className="text-gray-200 text-sm font-medium">{video.title}</p>
        <p className="text-gray-400 text-xs mt-2">
          Video မကြာခင် ထည့်ပေးပါမယ်။ အောက်က သင်ခန်းစာ၊ ဝေါဟာရ၊ သဒ္ဒါနဲ့ Quiz ကို အရင်
          လေ့လာနိုင်ပါတယ်။
        </p>
      </div>
    </div>
  );
}

export default function LessonVideoPlayer({ lessonId = 'n5-te-form' }: { lessonId?: string }) {
  const video = LESSON_VIDEOS[lessonId] ?? { id: lessonId, title: '', url: '' };
  const notesKey = `na_notes_${lessonId}`;

  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  // Notes are kept on this device
  useEffect(() => {
    try {
      const raw = localStorage.getItem(notesKey);
      if (raw) setSavedNotes(JSON.parse(raw));
    } catch {
      // ignore bad data
    }
  }, [notesKey]);

  const persist = (notes: string[]) => {
    setSavedNotes(notes);
    try {
      localStorage.setItem(notesKey, JSON.stringify(notes));
    } catch {
      // storage full or blocked
    }
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      persist([...savedNotes, noteText.trim()]);
      setNoteText('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative bg-gray-950 aspect-video">
        <VideoArea video={video} />
      </div>

      <div className="flex items-center justify-between px-4 py-2.5">
        <p className="text-xs text-muted-foreground truncate pr-3">{video.title}</p>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-medium flex-shrink-0 ${
            showNotes
              ? 'bg-[#006633]/10 text-[#006633] border-[#006633]/30'
              : 'bg-muted text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          📝 မှတ်စု{savedNotes.length > 0 ? ` (${savedNotes.length})` : ''}
        </button>
      </div>

      {showNotes && (
        <div className="border-t border-border px-4 py-4 bg-muted/30">
          <h4 className="text-sm font-semibold text-foreground mb-3">ကျွန်ုပ်၏ မှတ်စုများ</h4>
          {savedNotes.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {savedNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground group">
                  <span className="text-[#006633] mt-0.5 flex-shrink-0">•</span>
                  <span className="flex-1">{note}</span>
                  <button
                    onClick={() => persist(savedNotes.filter((_, j) => j !== i))}
                    className="text-xs text-muted-foreground hover:text-red-600"
                    aria-label="မှတ်စု ဖျက်ရန်"
                  >
                    ✕
                  </button>
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
              placeholder="မှတ်စု ရေးပါ..."
              className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#006633]/30 focus:border-[#006633]"
            />
            <button
              onClick={handleSaveNote}
              className="px-3 py-2 bg-[#006633] text-white text-sm font-medium rounded-lg hover:bg-[#005528] transition-colors"
            >
              သိမ်းမယ်
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            မှတ်စုတွေကို ဒီဖုန်း/ကွန်ပျူတာထဲမှာပဲ သိမ်းထားပါတယ်။
          </p>
        </div>
      )}
    </div>
  );
}
