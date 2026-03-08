import React, { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Send, User as UserIcon, MessageSquare, Clock } from 'lucide-react';

const CommentSection = ({ taskId }) => {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        try {
            const { data } = await API.get(`/comments?taskId=${taskId}`);
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        const loadingToast = toast.loading('Adding comment...');
        try {
            await API.post('/comments', { text, task: taskId });
            setText('');
            fetchComments();
            toast.success('Comment added!', { id: loadingToast });
        } catch (error) {
            toast.error('Failed to add comment.', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#161a1d] flex items-center justify-center shrink-0">
                    <UserIcon size={14} className="text-gray-500 dark:text-[#9fadbc]" />
                </div>
                <div className="flex-1 space-y-2">
                    <textarea
                        className="w-full px-3 py-2 border-2 border-[#dfe1e6] dark:border-[#333c44] hover:border-[#a5adba] dark:hover:border-[#5794f7] bg-white dark:bg-[#161a1d] rounded-lg text-sm text-[#172b4d] dark:text-[#b6c2cf] transition-all focus:border-[#0c66e4] outline-none min-h-[80px]"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || loading}
                        className="bg-[#0c66e4] text-white px-4 py-1.5 rounded font-bold text-sm hover:bg-[#0055cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                        <div className="w-8 h-8 rounded-full bg-[#0c66e4] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#172b4d] dark:text-[#b6c2cf]">{comment.user.name}</span>
                                <span className="text-[10px] text-[#44546f] dark:text-[#9fadbc] font-medium flex items-center gap-1 uppercase tracking-wider">
                                    <Clock size={10} /> {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-[#161a1d] p-3 rounded-lg border border-[#dfe1e6] dark:border-[#333c44] shadow-sm text-sm text-[#172b4d] dark:text-[#b6c2cf] leading-relaxed">
                                {comment.text}
                            </div>
                            <div className="flex gap-3 px-1 text-xs text-[#44546f] dark:text-[#9fadbc] font-medium">
                                <button className="hover:underline">Edit</button>
                                <button className="hover:underline">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div className="text-center py-6 text-[#44546f] dark:text-[#9fadbc] text-sm">
                        <MessageSquare size={24} className="mx-auto mb-2 opacity-20 dark:opacity-40" />
                        No comments yet. Start the conversation!
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
