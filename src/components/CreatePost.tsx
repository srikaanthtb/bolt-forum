'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';

type CreatePostProps = {
  onPostCreated: () => void;
};

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !content.trim()) return;
    
    console.log('Creating post with user:', user);
    
    setIsSubmitting(true);
    
    // First, ensure the user exists in the users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({ 
        id: user.id, 
        username: user.user_metadata?.username || 'Anonymous',
        email: user.email
      });
      
    if (userError) {
      console.error('Error ensuring user exists:', userError);
      setIsSubmitting(false);
      return;
    }
    
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
      });
    
    console.log('Post insertion error:', error);
    
    setIsSubmitting(false);
    
    if (!error) {
      setContent('');
      onPostCreated();
    }
  };

  if (!user) {
    return (
      <div className="border rounded-lg p-4 mb-6 bg-white">
        <p className="text-center text-gray-600">Sign in to create posts</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {content.length}/280
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
} 