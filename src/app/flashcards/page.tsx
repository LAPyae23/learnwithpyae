'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import FlashcardSession from './components/FlashcardSession';

export default function FlashcardsPage() {
  return (
    <AppLayout activePath="/flashcards">
      <FlashcardSession />
    </AppLayout>
  );
}
