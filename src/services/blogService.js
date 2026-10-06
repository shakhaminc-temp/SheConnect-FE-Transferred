// src/services/blogService.js
import api from '../api/axios'; // axios instance with JWT headers

// Fetch all blogs
export const getBlogs = async () => {
  const response = await api.get('/blogs/');
  return response.data.blogs; // backend returns { blogs: [...] }
};

// Create a new blog
export const createBlog = async (blogData) => {
  const response = await api.post('/blogs/create', blogData); 
  return {
    blog_id: response.data.blogId,
    ...blogData
  };
};

// Update blog
export const updateBlog = async (blogId, blogData) => {
  const response = await api.put(`/blogs/${blogId}`, blogData);
  return response.data.blog;
};

// Delete blog
export const deleteBlog = async (blogId) => {
  const response = await api.delete(`/blogs/${blogId}`);
  return response.data;
};
