'use client';

import { Post as PostType } from '@/types/database.types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import { useState } from 'react';

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
    <div className="border rounded-lg p-4 mb-4 bg-white">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 font-medium">
            {firstLetter}
          </span>
        </div>
        <div className="w-full overflow-hidden">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">{username}</h3>
            <span className="text-gray-500 text-sm">{formattedDate}</span>
          </div>
          <div className="w-full mt-2">
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} className="text-gray-800 w-full">
              {post.content}
            </p>
          </div>
          <div className="mt-3 flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
            >
              <span className="text-xl" role="img" aria-label="like">👍</span>
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 