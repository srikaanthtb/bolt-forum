'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Post as PostType } from '@/types/database.types';
import Navbar from '@/components/Navbar';
import Post from '@/components/Post';
import CreatePost from '@/components/CreatePost';


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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Home</h1>
        
        <CreatePost onPostCreated={fetchPosts} />
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length > 0 ? (
          <div>
            {posts.map(post => (
              <Post key={post.id} post={post} onUpdate={handlePostUpdate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to post!
          </div>
        )}
      </main>
    </div>
  );
}
