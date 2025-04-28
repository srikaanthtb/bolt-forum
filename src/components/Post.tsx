'use client';

import { Post as PostType } from '@/types/database.types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import { useState } from 'react';
import { motion } from 'framer-motion';

type PostProps = {
  post: PostType;
  onUpdate?: (post: PostType) => void;
};

export default function Post({ post, onUpdate }: PostProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  
  console.log('Post data:', post);

  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleLike = async () => {
    if (!user) return;

    if (isLiked) {
      // Unlike the post
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ user_id: user.id, post_id: post.id });

      if (!error) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        if (onUpdate) {
          onUpdate({ ...post, likes_count: likesCount - 1 });
        }
      }
    } else {
      // Like the post
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, post_id: post.id });

      if (!error) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        if (onUpdate) {
          onUpdate({ ...post, likes_count: likesCount + 1 });
        }
      }
    }
  };

  // Extract username from the post.user instead of post.users
  const username = post.user?.username || 'Unknown user';
  const firstLetter = username.charAt(0) || '?';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-xl p-6 mb-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
          {firstLetter.toUpperCase()}
        </div>
        <div className="w-full overflow-hidden">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-800">{username}</h3>
            <span className="text-gray-500 text-xs font-medium">{formattedDate}</span>
          </div>
          <div className="w-full mt-3">
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} className="text-gray-700 w-full leading-relaxed">
              {post.content}
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${
                isLiked 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              <span className="text-lg" role="img" aria-label="like">
                {isLiked ? '❤️' : '👍'}
              </span>
              <span className="font-medium">{likesCount}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 