// src/pages/Blog.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X, User, Calendar, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getBlogs, createBlog, deleteBlog } from '../services/blogService';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });

  // Fetch all blogs on component mount
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs();
        setBlogs(data);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      }
    };
    fetchBlogs();
  }, []);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBlog({ ...newBlog, [name]: value });
  };

  // Submit a new blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content) return;

    try {
      const createdBlog = await createBlog(newBlog);
      setBlogs([createdBlog, ...blogs]);
      setNewBlog({ title: '', content: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create blog:', err);
    }
  };

  // Delete a blog
  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await deleteBlog(blogId);
      setBlogs(blogs.filter(blog => blog.blog_id !== blogId));
    } catch (err) {
      console.error('Failed to delete blog:', err);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
          <h1 className="text-xl font-black tracking-tighter">
            She<span className="text-pink-600">Connect</span>
          </h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-50 rounded-xl text-gray-600"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="max-w-5xl mx-auto p-6 md:p-10">
          {/* Header + Write Blog Button */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <p className="text-pink-600 font-bold uppercase tracking-widest text-xs mb-2">
                Community Voices
              </p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Travel{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                  Stories
                </span>{' '}
                📖
              </h2>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-pink-100 transition-all font-bold flex items-center justify-center gap-2 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2">
                {showForm ? <X size={20} /> : <Plus size={20} />}
                {showForm ? 'Cancel Writing' : 'Write a Story'}
              </span>
            </button>
          </div>

          {/* Blog Form */}
          {showForm && (
            <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-pink-50/50 mb-10 border border-pink-100/50 animate-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-[10px]">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newBlog.title}
                    onChange={handleInputChange}
                    placeholder="Give your blog a catchy title..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-[10px]">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={newBlog.content}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Write about your journey, tips, or recommendations..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-medium leading-relaxed"
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-pink-600 text-white px-10 py-4 rounded-2xl hover:bg-pink-700 hover:shadow-xl hover:shadow-pink-200 transition-all font-black text-sm uppercase tracking-widest"
                  >
                    Publish Story
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Blog List */}
          <div className="space-y-8">
            {blogs.length === 0 ? (
              <div className="bg-white p-16 rounded-[40px] border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-bold text-lg">
                  No blogs yet. Be the first to share your journey! ✨
                </p>
              </div>
            ) : (
              blogs.map((blog) => (
                <div
                  key={blog.blog_id}
                  className="bg-white p-8 md:p-10 rounded-[40px] shadow border hover:border-pink-100 transition-all relative"
                >
                  <h2 className="text-3xl font-black text-gray-900 mb-4">{blog.title}</h2>
                  <div className="text-gray-700 leading-[1.8] font-medium text-lg whitespace-pre-wrap">
                    {blog.content}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{blog.author_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Just now'}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(blog.blog_id)}
                      className="ml-auto text-red-500 font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blog;
