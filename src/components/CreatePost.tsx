'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import { motion } from 'framer-motion';

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gray-200 rounded-xl p-6 mb-6 bg-white shadow-md"
      >
        <p className="text-center text-gray-600 font-medium">Sign in to create posts</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-xl p-6 mb-6 bg-white shadow-lg"
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
          {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <div className="font-medium">{user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous'}</div>
          <div className="text-xs text-gray-500">What's on your mind?</div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={3}
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            <span className={content.length > 240 ? 'text-orange-500' : content.length > 200 ? 'text-yellow-500' : 'text-gray-500'}>
              {content.length}
            </span>
            <span className="text-gray-400">/280</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span> : 
              'Post'
            }
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
} 