'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Post as PostType } from '@/types/database.types';
import Navbar from '@/components/Navbar';
import Post from '@/components/Post';
import CreatePost from '@/components/CreatePost';
import { motion } from 'framer-motion';

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    console.log('Fetching posts...');
    
    // First get all posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Posts data:', postsData);
    
    if (postsError) {
      console.error('Error fetching posts:', postsError);
      setLoading(false);
      return;
    }
    
    if (!postsData || postsData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }
    
    // Extract all user IDs
    const userIds = postsData.map(post => post.user_id);
    
    // Fetch user data for these IDs
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
      
    if (userError) {
      console.error('Error fetching users:', userError);
    }
    
    // Create a map of user IDs to user objects for quick lookup
    const userMap: { [key: string]: any } = {};
    if (userData) {
      userData.forEach(user => {
        userMap[user.id] = user;
      });
    }
    
    // Join the data manually
    const postsWithUsers = postsData.map(post => ({
      ...post,
      user: userMap[post.user_id] || null
    }));
    
    console.log('Posts with users:', postsWithUsers);
    setPosts(postsWithUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostUpdate = (updatedPost: PostType) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-gray-800 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
        >
          Home
        </motion.h1>
        
        <CreatePost onPostCreated={fetchPosts} />
        
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
            <div className="text-7xl mb-4">👋</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to create a post and start the conversation!</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
