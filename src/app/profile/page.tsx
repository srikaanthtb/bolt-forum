'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import { Post as PostType } from '@/types/database.types';
import Navbar from '@/components/Navbar';
import Post from '@/components/Post';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin');
      return;
    }
    
    const fetchUserPosts = async () => {
      setLoading(true);
      
      // First get all posts for this user
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching user posts:', postsError);
        setLoading(false);
        return;
      }
      
      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
      }
      
      // Join the data manually
      const postsWithUser = postsData.map(post => ({
        ...post,
        user: userData || null
      }));
      
      console.log('User posts with user data:', postsWithUser);
      setPosts(postsWithUser);
      setLoading(false);
    };

    fetchUserPosts();
  }, [user, authLoading, router]);

  const handlePostUpdate = (updatedPost: PostType) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex justify-center py-10">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // This will redirect to signin
  }

  const username = user?.user_metadata?.username || 'User';
  const firstLetter = username.charAt(0) || 'U';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200"
        >
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-2xl shadow-md mr-6">
              {firstLetter.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {username}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full inline-block font-medium">
                {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold mb-6 text-gray-800"
        >
          Your Posts
        </motion.h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : posts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {posts.map(post => (
              <Post key={post.id} post={post} onUpdate={handlePostUpdate} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 px-6 bg-white rounded-xl shadow-md border border-gray-200"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Share your thoughts with the community!</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all duration-200 font-medium"
            >
              Create Your First Post
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
} 