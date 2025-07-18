"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminDashboard() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogForm, setBlogForm] = useState({ title: "", content: "" });
  const [caseForm, setCaseForm] = useState({ title: "", content: "" });
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [caseImageFile, setCaseImageFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const blogFileInputRef = useRef();
  const caseFileInputRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("trio_admin_token");
    if (!token) router.replace("/admin/login");
    else fetchAll(token);
    // eslint-disable-next-line
  }, []);

  async function fetchAll(token) {
    setLoading(true);
    const [blogRes, caseRes] = await Promise.all([
      fetch("/api/blog-posts", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/case-studies", { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (blogRes.ok) setBlogPosts(await blogRes.json());
    else setError("Failed to fetch blog posts");
    if (caseRes.ok) setCaseStudies(await caseRes.json());
    else setError("Failed to fetch case studies");
    setLoading(false);
  }

  async function handleAdd(e, type) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("trio_admin_token");
    let imageUrl = "";
    let form = type === "blog" ? blogForm : caseForm;
    let imageFile = type === "blog" ? blogImageFile : caseImageFile;
    let fileInputRef = type === "blog" ? blogFileInputRef : caseFileInputRef;
    const endpoint = type === "blog" ? "/api/blog-posts" : "/api/case-studies";
    if (imageFile) {
      const uploadData = new FormData();
      uploadData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      if (uploadRes.ok && uploadJson.url) {
        imageUrl = uploadJson.url;
      } else {
        setError("Image upload failed");
        return;
      }
    }
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...form, image: imageUrl }),
    });
    if (res.ok) {
      if (type === "blog") {
        setBlogForm({ title: "", content: "" });
        setBlogImageFile(null);
        if (blogFileInputRef.current) blogFileInputRef.current.value = "";
      } else {
        setCaseForm({ title: "", content: "" });
        setCaseImageFile(null);
        if (caseFileInputRef.current) caseFileInputRef.current.value = "";
      }
      setSuccess("Post added!");
      fetchAll(token);
    } else {
      setError("Failed to add post");
    }
  }

  async function handleDelete(id, type) {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("trio_admin_token");
    const endpoint = type === "blog" ? "/api/blog-posts" : "/api/case-studies";
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setSuccess("Post deleted!");
      fetchAll(token);
    } else {
      setError("Failed to delete post");
    }
  }

  function handleLogout() {
    localStorage.removeItem("trio_admin_token");
    router.replace("/admin/login");
  }

  return (
    <div className="admin-dashboard animated-fade-in h-full">
      <header className="dashboard-header animated-slide-down">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <section className="add-post-section animated-bounce-in">
        <h2>Add Blog Post</h2>
        <form onSubmit={e => handleAdd(e, "blog")}> 
          <input
            type="text"
            placeholder="Title"
            value={blogForm.title}
            onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
            required
          />
          <input
            type="file"
            accept="image/*"
            ref={blogFileInputRef}
            onChange={e => setBlogImageFile(e.target.files[0])}
          />
          <textarea
            placeholder="Content"
            value={blogForm.content}
            onChange={e => setBlogForm({ ...blogForm, content: e.target.value })}
            required
          />
          <button type="submit">Add Blog Post</button>
        </form>
      </section>
      <section className="posts-list-section animated-fade-in">
        <h2>Blog Posts</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <ul className="posts-list">
            {blogPosts.map(post => (
              <li key={post.id} className="post-item animated-slide-up">
                <div className="post-info">
                  <strong>{post.title}</strong>
                  <span>{new Date(post.date).toLocaleString()}</span>
                  <span className="post-type">Blog Post</span>
                  {post.image && (
                    <Image
                      src={post.image}
                      alt="post"
                      width={80}
                      height={80}
                      style={{ marginTop: 8, borderRadius: 8, objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="post-actions">
                  <button onClick={() => handleDelete(post.id, "blog")} className="delete-btn">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="add-post-section animated-bounce-in">
        <h2>Add Case Study</h2>
        <form onSubmit={e => handleAdd(e, "case-study")}> 
          <input
            type="text"
            placeholder="Title"
            value={caseForm.title}
            onChange={e => setCaseForm({ ...caseForm, title: e.target.value })}
            required
          />
          <input
            type="file"
            accept="image/*"
            ref={caseFileInputRef}
            onChange={e => setCaseImageFile(e.target.files[0])}
          />
          <textarea
            placeholder="Content"
            value={caseForm.content}
            onChange={e => setCaseForm({ ...caseForm, content: e.target.value })}
            required
          />
          <button type="submit">Add Case Study</button>
        </form>
      </section>
      <section className="posts-list-section animated-fade-in">
        <h2>Case Studies</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <ul className="posts-list">
            {caseStudies.map(post => (
              <li key={post.id} className="post-item animated-slide-up">
                <div className="post-info">
                  <strong>{post.title}</strong>
                  <span>{new Date(post.date).toLocaleString()}</span>
                  <span className="post-type">Case Study</span>
                  {post.image && (
                    <Image
                      src={post.image}
                      alt="post"
                      width={80}
                      height={80}
                      style={{ marginTop: 8, borderRadius: 8, objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="post-actions">
                  <button onClick={() => handleDelete(post.id, "case-study")} className="delete-btn">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #10131a 0%, #23272f 100%);
          color: #f8f8ff;
          padding: 0;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 3vw 1rem 3vw;
          background: #181b22;
          border-bottom: 2px solid #22263a;
        }
        .logout-btn {
          background: #ff0080;
          color: #fff;
          border: none;
          padding: 0.5rem 1.2rem;
          font-size: 1rem;
          cursor: pointer;
          font-weight: bold;
          letter-spacing: 1px;
          box-shadow: 0 2px 8px 0 rgba(255,0,128,0.12);
          transition: background 0.2s;
        }
        .logout-btn:hover {
          background: #c8005a;
        }
        .add-post-section, .posts-list-section {
          margin: 2rem auto;
          max-width: 600px;
          background: #181b22;
          border: 2px solid #23263a;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.25);
          padding: 2rem;
          /* No border-radius for sharp look */
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        input, textarea, select {
          padding: 0.75rem 1rem;
          border: 2px solid #23263a;
          background: #10131a;
          color: #f8f8ff;
          font-size: 1rem;
          outline: none;
          /* No border-radius for sharp look */
        }
        input:focus, textarea:focus, select:focus {
          border-color: #00eaff;
        }
        textarea {
          min-height: 80px;
        }
        button[type="submit"] {
          background: #00eaff;
          color: #181b22;
          border: none;
          font-weight: bold;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          cursor: pointer;
          letter-spacing: 1px;
          transition: background 0.2s, color 0.2s;
        }
        button[type="submit"]:hover {
          background: #00b3c6;
          color: #fff;
        }
        .success {
          color: #00eaff;
          margin-top: 0.5rem;
          font-weight: bold;
        }
        .error {
          color: #ff0080;
          margin-top: 0.5rem;
          font-weight: bold;
        }
        .posts-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .post-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #10131a;
          margin-bottom: 1rem;
          padding: 1rem;
          border: 2px solid #23263a;
          /* No border-radius for sharp look */
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.12);
        }
        .post-info {
          display: flex;
          flex-direction: column;
        }
        .post-type {
          font-size: 0.95rem;
          color: #00eaff;
          margin-top: 0.2rem;
          font-weight: bold;
        }
        .post-actions {
          display: flex;
          gap: 0.5rem;
        }
        .delete-btn {
          background: #ff0080;
          color: #fff;
          border: none;
          padding: 0.4rem 1rem;
          font-size: 0.95rem;
          cursor: pointer;
          font-weight: bold;
          letter-spacing: 1px;
          transition: background 0.2s;
        }
        .delete-btn:hover {
          background: #c8005a;
        }
        .post-info img {
          margin-top: 0.5rem;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.17);
        }
        /* Animations */
        .animated-fade-in {
          animation: fadeIn 1s ease;
        }
        .animated-bounce-in {
          animation: bounceIn 0.8s;
        }
        .animated-shake {
          animation: shake 0.4s;
        }
        .animated-slide-up {
          animation: slideUp 0.7s;
        }
        .animated-slide-down {
          animation: slideDown 0.7s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        /* Responsive */
        @media (max-width: 700px) {
          .add-post-section, .posts-list-section {
            max-width: 98vw;
            padding: 1rem;
          }
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1.2rem 2vw 0.5rem 2vw;
          }
        }
      `}</style>
    </div>
  );
} 