/**
 * Lesson videos. Put a YouTube link (watch, youtu.be or shorts URL) or a direct .mp4 link in `url`.
 * Leave `url` empty to show a "video coming soon" panel instead of a player.
 *
 * Tip: upload your own lessons to YouTube as "Unlisted" — free hosting, and it adapts quality
 * to slow mobile connections.
 */
export interface LessonVideo {
  id: string;
  title: string;
  url: string;
}

export const LESSON_VIDEOS: Record<string, LessonVideo> = {
  'n5-te-form': {
    id: 'n5-te-form',
    title: 'て ပုံစံ ဆက်စပ်အသုံး — သင်ခန်းစာ ၇',
    url: '',
  },
};
