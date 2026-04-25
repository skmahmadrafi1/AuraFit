import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import api, { handleApiError } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart, Loader2, MessageSquare, Flame, Trophy, Send, Zap,
  Users, Github, Linkedin, Twitter, Instagram, Facebook,
  MessageCircle, Globe, ChevronDown, ChevronUp, Plus, X
} from "lucide-react";

/* ── constants ────────────────────────────── */
const MEDAL_ICONS = ["🥇", "🥈", "🥉"];

const SOCIAL_LINKS = [
  {
    icon: Facebook, label: "Facebook", href: "https://facebook.com",
    color: "#1877f2", bg: "rgba(24,119,242,0.12)"
  },
  {
    icon: Instagram, label: "Instagram", href: "https://instagram.com",
    color: "#e1306c",
    bg: "rgba(225,48,108,0.12)"
  },
  {
    icon: Twitter, label: "Twitter / X", href: "https://twitter.com",
    color: "#1da1f2", bg: "rgba(29,161,242,0.12)"
  },
  {
    icon: MessageCircle, label: "WhatsApp", href: "https://chat.whatsapp.com",
    color: "#25d366", bg: "rgba(37,211,102,0.12)"
  },
  {
    icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com",
    color: "#0a66c2", bg: "rgba(10,102,194,0.12)"
  },
  {
    icon: Github, label: "GitHub", href: "https://github.com",
    color: "#e6edf3", bg: "rgba(230,237,243,0.08)"
  },
  {
    icon: Globe, label: "Discord", href: "https://discord.com",
    color: "#5865f2", bg: "rgba(88,101,242,0.12)"
  },
];

/* ── tiny helpers ──────────────────────────── */
const getInitial = (name) => (name || "?")[0].toUpperCase();

const Avatar = ({ name, size = 10 }) => (
  <div
    className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full text-base font-bold text-white`}
    style={{ background: "linear-gradient(135deg, hsl(258 80% 68%), hsl(192 100% 50%))" }}
  >
    {getInitial(name)}
  </div>
);

const staggerWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ── Community component ───────────────────── */
const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [commentTexts, setCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [reactingPostId, setReactingPostId] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchLeaderboard();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await api.get("/community");
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = handleApiError(err);
      setError(err?.code === "ERR_BLOCKED_BY_CLIENT" ? "Backend connection blocked." : msg);
      setPosts([]);
    } finally { setIsLoading(false); }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get("/community/leaderboard");
      if (data.success) setLeaderboard(data.leaderboard || []);
    } catch { /* silent */ }
  };

  const handleReact = async (postId, reactionType) => {
    if (!user?._id && !user?.id) {
      toast({ title: "Login required", description: "You need to be logged in to react.", variant: "destructive" });
      return;
    }
    setReactingPostId(postId);
    try {
      const { data } = await api.patch(`/community/${postId}/react`, {
        userId: user._id || user.id, reactionType,
      });
      if (data.success) await fetchPosts();
    } catch (err) {
      toast({ title: "Reaction failed", description: handleApiError(err), variant: "destructive" });
    } finally { setReactingPostId(null); }
  };

  const handleComment = async (postId) => {
    if (!user?._id || !commentTexts[postId]?.trim()) return;
    try {
      const { data } = await api.post(`/community/${postId}/comment`, {
        userId: user._id || user.id,
        author: user.name || user.email,
        content: commentTexts[postId],
      });
      if (data.success) {
        await fetchPosts();
        setCommentTexts(p => ({ ...p, [postId]: "" }));
        toast({ title: "Comment added!" });
      }
    } catch (err) {
      toast({ title: "Comment failed", description: handleApiError(err), variant: "destructive" });
    }
  };

  const handleNewPost = async () => {
    if (!newPostContent.trim() || !user) return;
    setIsPosting(true);
    try {
      await api.post("/community", {
        userId: user._id || user.id,
        author: user.name || user.email,
        content: newPostContent,
      });
      setNewPostContent("");
      setShowNewPost(false);
      toast({ title: "Post shared! 🎉" });
      await fetchPosts();
    } catch (err) {
      toast({ title: "Post failed", description: handleApiError(err), variant: "destructive" });
    } finally { setIsPosting(false); }
  };

  const toggleComments = (postId) => setExpandedComments(p => ({ ...p, [postId]: !p[postId] }));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────── */}
      <div
        className="relative pt-28 pb-12 px-4 overflow-hidden"
        style={{ background: "linear-gradient(180deg, hsl(252 50% 5%), hsl(252 40% 4%))" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-8 h-80 w-80 rounded-full opacity-[0.07] blur-3xl"
            style={{ background: "hsl(258 80% 68%)" }} />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full opacity-[0.06] blur-3xl"
            style={{ background: "hsl(192 100% 50%)" }} />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 mb-5">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Community Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, hsl(258 80% 75%), hsl(192 100% 60%))" }}>
            Train Together, Win Together
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Share your fitness wins, cheer each other on, and climb the leaderboard — your tribe awaits.
          </p>

          {/* Social links row */}
          <div className="mt-8 flex items-center justify-center flex-wrap gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href, color, bg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium
                           hover:scale-105 hover:border-transparent transition-all duration-200"
                style={{ background: bg, color }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── feed ─────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* New post bar */}
          {user ? (
            <div className="rounded-2xl border border-border bg-card p-4">
              {!showNewPost ? (
                <button
                  onClick={() => setShowNewPost(true)}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <Avatar name={user.name || user.email} size={10} />
                  <span className="flex-1 rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/30 transition-colors">
                    Share your fitness win today…
                  </span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">New Post</span>
                    <button onClick={() => setShowNewPost(false)}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </div>
                  <Textarea
                    placeholder="What did you crush today? Share a PR, a feeling, or some motivation... 💪"
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    className="min-h-[100px] resize-none border-border bg-muted/20 text-foreground placeholder:text-muted-foreground text-sm rounded-xl"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowNewPost(false)}>Cancel</Button>
                    <Button
                      size="sm"
                      disabled={!newPostContent.trim() || isPosting}
                      onClick={handleNewPost}
                      className="bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl px-5"
                    >
                      {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1.5" /> Post</>}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
              <a href="/login" className="text-primary hover:underline font-semibold">Log in</a> to post and interact with the community.
            </div>
          )}

          {/* Loading / error / feed */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchPosts}>Retry</Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">No posts yet</p>
              <p className="text-sm text-muted-foreground">Be the first to share your training progress!</p>
            </div>
          ) : (
            <motion.div variants={staggerWrap} initial="hidden" animate="show" className="space-y-4">
              {posts.map((post, idx) => {
                const isExpanded = expandedComments[post._id];
                const visibleComments = isExpanded ? post.comments : post.comments?.slice(-2);

                return (
                  <motion.div key={post._id || idx} variants={staggerItem}>
                    <div className="rounded-2xl border border-border bg-card hover:border-primary/20 transition-all duration-300">
                      {/* Post header */}
                      <div className="flex items-center gap-3 p-5 pb-3">
                        <Avatar name={post.author} size={10} />
                        <div>
                          <p className="font-semibold text-foreground text-sm">{post.author || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now"}
                          </p>
                        </div>
                      </div>

                      {/* Post content */}
                      <p className="px-5 pb-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Reactions */}
                      <div className="flex items-center gap-1 px-4 pb-3 border-b border-border">
                        {[
                          { type: "like", Icon: Heart, count: post.likes || 0, hoverCls: "hover:text-rose-400 hover:bg-rose-500/10" },
                          { type: "fire", Icon: Flame, count: post.fire || 0, hoverCls: "hover:text-orange-400 hover:bg-orange-500/10" },
                          { type: "trophy", Icon: Trophy, count: post.trophy || 0, hoverCls: "hover:text-yellow-400 hover:bg-yellow-500/10" },
                        ].map(({ type, Icon, count, hoverCls }) => (
                          <button
                            key={type}
                            onClick={() => handleReact(post._id, type)}
                            disabled={reactingPostId === post._id}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors ${hoverCls}`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs font-semibold">{count}</span>
                          </button>
                        ))}

                        <button
                          className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => toggleComments(post._id)}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post.comments?.length || 0} comments
                          {post.comments?.length > 2 ? (isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
                        </button>
                      </div>

                      {/* Comments */}
                      <AnimatePresence>
                        {(post.comments?.length > 0) && (
                          <div className="p-4 pt-3 space-y-2">
                            {visibleComments?.map((comment, ci) => (
                              <div key={ci} className="flex gap-2.5 rounded-xl bg-muted/15 p-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-xs font-bold text-foreground">
                                  {getInitial(comment.author)}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-foreground">{comment.author}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                            {!isExpanded && post.comments?.length > 2 && (
                              <button
                                className="text-xs text-primary hover:underline"
                                onClick={() => toggleComments(post._id)}
                              >
                                View all {post.comments.length} comments
                              </button>
                            )}
                          </div>
                        )}
                      </AnimatePresence>

                      {/* Comment input */}
                      {user && (
                        <div className="flex gap-2 px-4 pb-4">
                          <Input
                            placeholder="Write a comment…"
                            value={commentTexts[post._id] || ""}
                            onChange={e => setCommentTexts(p => ({ ...p, [post._id]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && handleComment(post._id)}
                            className="border-border bg-muted/20 text-foreground placeholder:text-muted-foreground text-sm rounded-xl"
                          />
                          <Button
                            size="sm" variant="outline"
                            className="border-border hover:bg-primary/10 hover:border-primary/30 rounded-xl"
                            onClick={() => handleComment(post._id)}
                            disabled={!commentTexts[post._id]?.trim()}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── sidebar ───────── */}
        <div className="space-y-5">
          {/* Leaderboard */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/10 transition-colors"
              onClick={() => setShowLeaderboard(s => !s)}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="font-bold text-foreground text-sm">Leaderboard</span>
              </div>
              {showLeaderboard ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {showLeaderboard && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                    {leaderboard.length ? leaderboard.slice(0, 8).map((entry, i) => (
                      <div key={entry._id || i}
                        className="flex items-center justify-between rounded-xl bg-muted/15 p-2.5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base w-6 text-center">{MEDAL_ICONS[i] || `${i + 1}`}</span>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                            {getInitial(entry.name || entry.email)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground leading-tight">{entry.name || "Anonymous"}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[80px]">{entry.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-xs font-bold text-primary">{entry.xp || 0}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground text-center py-4">No rankings yet.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Connect with us */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Connect With Us
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href, color, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium
                             hover:scale-105 hover:border-transparent transition-all duration-200"
                  style={{ background: bg, color }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Community stats */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Community Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: "Total Posts", value: posts.length, icon: MessageSquare },
                { label: "Active Members", value: leaderboard.length, icon: Users },
                { label: "Total Reactions", value: posts.reduce((s, p) => s + (p.likes || 0) + (p.fire || 0) + (p.trophy || 0), 0), icon: Heart },
                { label: "Comments Today", value: posts.reduce((s, p) => s + (p.comments?.length || 0), 0), icon: MessageCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-3">Community Guidelines</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Be kind and supportive to all members</li>
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Share progress — big or small wins count</li>
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> No spam or promotional content</li>
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Respect everyone's fitness journey</li>
              <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Keep posts fitness & wellness related</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
