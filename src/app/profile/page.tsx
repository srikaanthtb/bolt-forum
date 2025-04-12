'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase';
import { Post as PostType } from '@/types/database.types';
import Navbar from '@/components/Navbar';
import Post from '@/components/Post';
import { useRouter } from 'next/navigation';

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
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id(id, username, email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setPosts(data || []);
      }
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
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // This will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
          <div className="text-gray-600">
            <p>Username: {user?.user_metadata?.username || 'N/A'}</p>
            <p>Email: {user?.email}</p>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-4">Your Posts</h2>
        
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
            You haven't posted anything yet.
          </div>
        )}
      </main>
    </div>
  );
} 