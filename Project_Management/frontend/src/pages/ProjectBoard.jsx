import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import CommentSection from '../components/CommentSection';
import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    LayoutGrid,
    MoreHorizontal,
    Plus,
    X,
    Layout,
    CheckCircle2,
    Link as LinkIcon,
    ChevronRight,
    Search as SearchIcon,
    Star,
    Users,
    Filter,
    Share2,
    Activity,
    Tag,
    CheckSquare,
    Clock,
    Paperclip,
    ChevronDown,
    Trash2,
    Pencil,
    ArrowLeft
} from 'lucide-react';

const ProjectBoard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showConfirm } = useUI();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeColumn, setActiveColumn] = useState('todo');
    const [taskTitle, setTaskTitle] = useState('');

    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [taskBeingEdited, setTaskBeingEdited] = useState(null);
    const [selectedTaskColor, setSelectedTaskColor] = useState('bg-blue-400');
    const [showShareModal, setShowShareModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [shareQuery, setShareQuery] = useState('');
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const handleUpdateTaskColor = async (taskId, colorClass) => {
        const loadingToast = toast.loading('Updating card color...');
        try {
            await API.put(`/tasks/${taskId}`, { color: colorClass });
            fetchTasks();
            toast.success('Color updated!', { id: loadingToast });
        } catch (error) {
            toast.error('Failed to update color.', { id: loadingToast });
        }
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newStatus = destination.droppableId;

        // Optimistic UI update
        setTasks(prev => prev.map(t =>
            t._id === draggableId ? { ...t, status: newStatus } : t
        ));

        try {
            await API.put(`/tasks/${draggableId}`, { status: newStatus });
            if (newStatus === 'done' && source.droppableId !== 'done') {
                toast.success('Task marked as done! 🎉');
            }
        } catch (e) {
            toast.error('Failed to move task.');
            fetchTasks(); // Rollback on error
        }
    };

    const fetchProjectDetails = async () => {
        try {
            const { data } = await API.get(`/projects/${id}`);
            setProject(data);
        } catch (error) {
            console.error('Error fetching project details:', error);
            navigate('/boards');
        }
    };

    const fetchTasks = async () => {
        try {
            const { data } = await API.get(`/tasks?projectId=${id}`);
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/auth/users');
            setAllUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
        fetchTasks();
        fetchUsers();
    }, [id]);

    const handleShareProject = (userToInvite) => {
        setInvitedUsers(prev => [...prev, userToInvite._id]);
        toast.success(`${userToInvite.name} has been invited to this board! 🚀`);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;
        const loadingToast = toast.loading('Adding card...');
        try {
            if (taskBeingEdited) {
                await API.put(`/tasks/${taskBeingEdited._id}`, { title: taskTitle });
                toast.success('Card updated!', { id: loadingToast });
            } else {
                await API.post('/tasks', {
                    title: taskTitle,
                    project: id,
                    status: activeColumn,
                    color: selectedTaskColor
                });
                toast.success('Card added successfully!', { id: loadingToast });
            }
            setTaskTitle('');
            setShowTaskModal(false);
            setTaskBeingEdited(null);
            fetchTasks();
        } catch (error) {
            toast.error('Operation failed.', { id: loadingToast });
        }
    };

    const handleDeleteTask = async (taskId) => {
        const loadingToast = toast.loading('Deleting card...');
        try {
            await API.delete(`/tasks/${taskId}`);
            fetchTasks();
            if (selectedTask?._id === taskId) setSelectedTask(null);
            toast.success('Card deleted successfully!', { id: loadingToast });
        } catch (error) {
            toast.error('Failed to delete card.', { id: loadingToast });
        }
    };

    const handleCompleteTask = async (task) => {
        const loadingToast = toast.loading('Updating task status...');
        try {
            const newStatus = task.status === 'done' ? 'todo' : 'done';
            await API.put(`/tasks/${task._id}`, { status: newStatus });
            fetchTasks();
            if (newStatus === 'done') {
                toast.success('Task completed! Great job! 🎉', { id: loadingToast });
            } else {
                toast.success('Task moved back to To Do.', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Failed to update task.', { id: loadingToast });
        }
    };

    const openAddTask = (status) => {
        setActiveColumn(status);
        setShowTaskModal(true);
    };

    const handleAddList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        const loadingToast = toast.loading('Adding list...');

        // Create slug for status
        const slug = newListTitle.toLowerCase().trim().replace(/\s+/g, '');

        try {
            const updatedLists = [...(project.lists || []), slug];
            const { data } = await API.put(`/projects/${id}`, { lists: updatedLists });
            setProject(data);
            setNewListTitle('');
            setIsAddingList(false);
            toast.success('List added successfully!', { id: loadingToast });
        } catch (error) {
            toast.error('Failed to add list.', { id: loadingToast });
        }
    };

    const renderList = (status) => {
        const titleMap = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
        const title = titleMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
        const listTasks = tasks.filter(t => t.status === status);

        return (
            <div key={status} className="w-80 flex flex-col max-h-full shrink-0 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#f1f2f4] dark:bg-[#161a1d] rounded-2xl flex flex-col max-h-[calc(100vh-160px)] shadow-sm hover:shadow-md transition-shadow border border-transparent dark:border-[#333c44]">
                    <div className="p-4 pb-2 flex items-center justify-between">
                        <h3 className="px-1 font-black text-sm text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">{title}</h3>
                        <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333c44] rounded-md text-[#44546f] dark:text-[#9fadbc] transition-colors"><MoreHorizontal size={14} /></button>
                    </div>

                    <Droppable droppableId={status}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="flex-1 overflow-y-auto px-2 py-1 space-y-2 min-h-[10px]"
                            >
                                {listTasks.map((task, index) => (
                                    <Draggable key={task._id} draggableId={task._id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`bg-white dark:bg-[#1d2125] p-2.5 rounded-lg shadow-sm border border-transparent hover:border-[#0c66e4] cursor-pointer group transition-all relative ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl !border-[#0c66e4]' : ''}`}
                                                onClick={() => setSelectedTask(task)}
                                            >
                                                <div className="flex justify-between mb-2">
                                                    <div className={`h-2 w-10 rounded-full ${task.color || (status === 'done' ? 'bg-emerald-400' : 'bg-blue-400')}`} title="Task color" />
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setShowTaskModal(true); setTaskTitle(task.title); setActiveColumn(task.status); setTaskBeingEdited(task); }}
                                                            className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Edit card"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleCompleteTask(task); }}
                                                            className={`p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40 ${task.status === 'done' ? 'text-emerald-600' : 'text-gray-400'}`}
                                                            title={task.status === 'done' ? 'Undo completion' : 'Mark as done'}
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                showConfirm({
                                                                    title: 'Delete Card',
                                                                    message: 'Are you sure you want to delete this card? This action will remove all comments and activity associated with it.',
                                                                    onConfirm: () => handleDeleteTask(task._id)
                                                                });
                                                            }}
                                                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Delete card"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] leading-snug group-hover:text-[#0c66e4] transition-colors ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
                                                    {task.title}
                                                </div>
                                                {task.assignedTo && (
                                                    <div className="mt-4 flex justify-end">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0c66e4] to-blue-400 text-white text-[9px] flex items-center justify-center font-black shadow-inner">
                                                            {task.assignedTo.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <div className="p-3 pt-1 border-t border-gray-200/50 dark:border-[#333c44] mt-1">
                        <button
                            onClick={() => openAddTask(status)}
                            className="w-full flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-[#333c44] rounded-lg text-sm font-black text-[#44546f] dark:text-[#9fadbc] transition-all group"
                        >
                            <div className="p-1.5 bg-gray-100 dark:bg-[#1a1d21] rounded group-hover:bg-white dark:group-hover:bg-[#333c44] transition-colors"><Plus size={14} /></div>
                            <span>Add a card</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-[#1d2125] animate-in fade-in duration-500 transition-colors">
            {/* Board Header */}
            <div className="h-14 shrink-0 flex items-center justify-between px-6 bg-[#f7f8f9] dark:bg-[#161a1d] text-[#172b4d] dark:text-[#b6c2cf] border-b border-[#dfe1e6] dark:border-[#333c44] shadow-sm transition-colors relative z-10">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/boards')}
                        className="p-1.5 bg-gray-200 dark:bg-[#333c44] hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all text-[#44546f] dark:text-[#9fadbc] flex items-center gap-1.5 px-3"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm font-bold hidden md:block">Boards</span>
                    </button>

                    <div className="h-4 w-px bg-[#dfe1e6]" />

                    <div className="flex items-center gap-2 group cursor-pointer px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-[#333c44] rounded-md transition-all">
                        <h2 className="text-lg font-black tracking-tight">{project?.name || 'Loading...'}</h2>
                        <Star size={16} className="text-[#44546f] group-hover:text-amber-400 group-hover:fill-amber-400" />
                    </div>

                    <button
                        onClick={() => setIsAddingList(true)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-all text-[#44546f] hover:text-[#172b4d]"
                        title="Add another list"
                    >
                        <Plus size={20} />
                    </button>

                    <div className="h-4 w-px bg-[#dfe1e6]" />

                    <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 rounded-md transition-colors text-sm font-bold text-[#44546f]">
                        <Users size={16} strokeWidth={2.5} />
                        <span className="hidden md:inline">Workspace visible</span>
                    </button>

                    <div className="h-4 w-px bg-[#dfe1e6]" />

                    <div className="bg-gray-100 text-[#44546f] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#dfe1e6]">Board</div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-bold shadow-sm ${showFilterDropdown
                                ? 'bg-blue-50 text-[#0c66e4] ring-2 ring-[#0c66e4]/20'
                                : 'hover:bg-gray-200 dark:hover:bg-[#333c44] text-[#44546f] dark:text-[#9fadbc]'
                                } `}
                        >
                            <Filter size={16} /> <span className="hidden lg:inline">Filter</span>
                        </button>

                        {showFilterDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#1d2125] border border-[#dfe1e6] dark:border-[#333c44] rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 border-b border-[#dfe1e6] dark:border-[#333c44]">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#44546f] dark:text-[#9fadbc]">Sort by</span>
                                    </div>
                                    <div className="p-1">
                                        {[
                                            { label: 'A to Z', desc: 'Alphabetical order' },
                                            { label: 'Last Modify', desc: 'Recently edited first' },
                                            { label: 'Date and Time', desc: 'Creation date' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.label}
                                                onClick={() => {
                                                    toast.success(`Sorting by ${opt.label} `);
                                                    setShowFilterDropdown(false);
                                                }}
                                                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-[#161a1d] rounded-lg transition-colors group"
                                            >
                                                <div className="text-sm font-bold text-[#172b4d] dark:text-[#b6c2cf] group-hover:text-[#0c66e4] transition-colors">{opt.label}</div>
                                                <div className="text-[10px] text-[#44546f] dark:text-[#9fadbc] font-medium">{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 bg-[#0c66e4] text-white px-5 py-2 rounded-lg font-black text-sm hover:bg-[#0055cc] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/10"
                    >
                        <Share2 size={16} /> Share
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-[#333c44] rounded-md transition-colors text-[#44546f] dark:text-[#9fadbc]"><MoreHorizontal size={20} /></button>
                </div>
            </div>

            {/* Board Horizontal Container */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className={`flex-1 overflow-x-auto p-8 min-h-0 transition-colors relative ${project?.background || 'bg-[#ffffff] dark:bg-[#1d2125]'}`}>
                    {project?.background?.includes('url') && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}
                    <div className="flex gap-8 items-start h-full pb-4 items-stretch relative z-10">
                        {(project?.lists || ['todo', 'inprogress', 'done']).map(status => renderList(status))}

                        {!isAddingList && (
                            <button
                                onClick={() => setIsAddingList(true)}
                                className="w-80 shrink-0 bg-gray-100/50 dark:bg-[#161a1d]/50 hover:bg-gray-100 dark:hover:bg-[#161a1d] border-2 border-dashed border-gray-200 dark:border-[#333c44] p-6 rounded-2xl flex flex-col items-center justify-center gap-4 text-[#44546f] dark:text-[#9fadbc] transition-all group min-h-[160px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1d2125] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                                <span className="font-black text-sm uppercase tracking-widest">Add another list</span>
                            </button>
                        )}
                    </div>
                </div>
            </DragDropContext>

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="modal-overlay overflow-y-auto pt-20 pb-20" onClick={() => setSelectedTask(null)}>
                    <div className="bg-[#f7f8f9] dark:bg-[#1d2125] rounded-2xl w-full max-w-3xl shadow-[0_32px_128px_rgba(0,0,0,0.5)] transition-all animate-in zoom-in-95 duration-300 border border-white/20 dark:border-[#333c44]" onClick={e => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex gap-5 items-start">
                                    <div className="p-2 bg-gray-200 dark:bg-[#161a1d] rounded-lg shrink-0 mt-1">
                                        <Layout className="text-[#44546f] dark:text-[#9fadbc]" size={20} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">{selectedTask.title}</h2>
                                        <div className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                            in list <span className="underline cursor-pointer text-[#44546f] dark:text-[#9fadbc] hover:text-[#0c66e4]">{selectedTask.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-[#333c44] rounded-full text-[#44546f] dark:text-[#9fadbc] transition-all"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[1fr,240px] gap-12">
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-[#172b4d] dark:text-[#b6c2cf] font-black text-lg">
                                            <Activity size={22} className="text-[#0c66e4]" /> Activity
                                        </div>
                                        <div className="ml-0 lg:ml-10 bg-white/50 dark:bg-[#161a1d]/50 p-6 rounded-2xl border border-[#dfe1e6] dark:border-[#333c44]">
                                            <CommentSection taskId={selectedTask._id} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Add to card</div>
                                        {[
                                            { icon: Users, label: 'Members' },
                                            { icon: Tag, label: 'Labels' },
                                            { icon: CheckSquare, label: 'Checklist' },
                                            { icon: Clock, label: 'Dates' },
                                            { icon: Paperclip, label: 'Attachment' }
                                        ].map(btn => (
                                            <button key={btn.label} className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#161a1d] border border-[#dfe1e6] dark:border-[#333c44] hover:border-[#0c66e4] hover:bg-blue-50 dark:hover:bg-[#1d2125] rounded-xl text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] transition-all group shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <btn.icon size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-[#0c66e4]" />
                                                    {btn.label}
                                                </div>
                                                <ChevronDown size={14} className="opacity-30 dark:opacity-50" />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Actions</div>
                                        <button
                                            onClick={() => handleDeleteTask(selectedTask._id)}
                                            className="w-full text-left px-5 py-2.5 bg-white dark:bg-[#161a1d] border border-[#dfe1e6] dark:border-[#333c44] hover:border-[#ef4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-black text-[#172b4d] dark:text-red-400 transition-all shadow-sm flex items-center gap-3 group"
                                        >
                                            <Trash2 size={16} className="text-gray-400 dark:text-red-500 group-hover:text-red-500" /> Delete Card
                                        </button>
                                        {['Move', 'Copy', 'Archive'].map(label => (
                                            <button key={label} className="w-full text-left px-5 py-2.5 bg-white dark:bg-[#161a1d] border border-[#dfe1e6] dark:border-[#333c44] hover:border-[#0c66e4] hover:bg-blue-50 dark:hover:bg-[#1d2125] rounded-xl text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] transition-all shadow-sm">{label}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Task Modal (Centered) */}
            {showTaskModal && (
                <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                    <div className="modal-content animate-in zoom-in-95 p-8 max-w-md bg-white dark:bg-[#1d2125] border-b-8 border-b-[#0c66e4] border dark:border-[#333c44]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3 font-black text-lg text-[#172b4d] dark:text-[#b6c2cf]">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Plus size={20} className="text-[#0c66e4] dark:text-[#5794f7]" /></div>
                                <span>{taskBeingEdited ? 'Edit Card' : 'New Card'}</span>
                            </div>
                            <button onClick={() => setShowTaskModal(false)} className="text-[#44546f] dark:text-[#9fadbc] hover:bg-gray-100 dark:hover:bg-[#333c44] p-1 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-[#9fadbc] uppercase tracking-widest">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 border-2 border-[#dfe1e6] dark:border-[#333c44] rounded-xl focus:border-[#0c66e4] outline-none text-base font-bold min-h-[120px] resize-none shadow-inner bg-gray-50 dark:bg-[#161a1d] text-[#172b4d] dark:text-[#b6c2cf] focus:bg-white dark:focus:bg-[#1d2125] transition-all"
                                        placeholder="What needs to be done?"
                                        autoFocus
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Card Color</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['bg-blue-400', 'bg-emerald-400', 'bg-orange-400', 'bg-red-400', 'bg-purple-400', 'bg-pink-400', 'bg-sky-400', 'bg-indigo-400'].map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedTaskColor(c);
                                                    if (taskBeingEdited) handleUpdateTaskColor(taskBeingEdited._id, c);
                                                }}
                                                className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${c} border-4 ${selectedTaskColor === c ? 'border-white shadow-lg scale-110' : 'border-transparent opacity-80 hover:opacity-100'} `}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={() => setShowTaskModal(false)} type="button" className="flex-1 px-4 py-3 text-sm font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded-xl transition-all">Discard</button>
                                <button type="submit" disabled={!taskTitle.trim()} className="flex-[2] bg-[#0c66e4] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#0055cc] disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                    {taskBeingEdited ? 'Update Card' : `Add to ${activeColumn} `}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add List Modal/Overlay */}
            {isAddingList && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddingList(false)}>
                    <div className="bg-[#f1f2f4] dark:bg-[#1d2125] p-6 rounded-2xl shadow-2xl border-2 border-white/20 dark:border-[#333c44] w-80 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <h3 className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] mb-4 uppercase tracking-widest">Add new list</h3>
                        <form onSubmit={handleAddList}>
                            <input
                                type="text"
                                autoFocus
                                placeholder="Enter list title..."
                                className="w-full px-4 py-3 border-2 border-[#0c66e4] rounded-xl text-sm font-bold outline-none mb-4 shadow-inner bg-white dark:bg-[#161a1d] text-[#172b4d] dark:text-[#b6c2cf]"
                                value={newListTitle}
                                onChange={(e) => setNewListTitle(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <button type="submit" className="flex-1 bg-[#0c66e4] text-white py-2.5 rounded-lg font-black text-sm hover:bg-[#0055cc] shadow-md transition-all">Add list</button>
                                <button onClick={() => setIsAddingList(false)} className="px-4 py-2.5 hover:bg-gray-200 dark:hover:bg-[#333c44] rounded-lg text-[#44546f] dark:text-[#9fadbc] font-bold text-sm transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showShareModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1d2125] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 p-0 border dark:border-[#333c44]">
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-white dark:bg-[#1d2125]">
                            <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">Share board</h2>
                            <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded-lg text-gray-500 transition-all active:scale-95"><X size={24} /></button>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Input Area */}
                            <div className="flex gap-2">
                                <div className="flex-1 relative group bg-white dark:bg-[#091e42]/05">
                                    <input
                                        type="text"
                                        placeholder="Email address or name"
                                        className="w-full px-4 py-3 bg-white dark:bg-[#161a1d] border-2 border-[#dfe1e6] dark:border-[#333c44] rounded-lg focus:border-[#0c66e4] focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-[#172b4d] dark:text-[#b6c2cf] transition-all"
                                        value={shareQuery}
                                        onChange={(e) => setShareQuery(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <button className="h-full px-5 py-3 border-2 border-[#dfe1e6] dark:border-[#333c44] rounded-lg flex items-center gap-3 text-sm font-black text-[#44546f] dark:text-[#b6c2cf] hover:bg-gray-50 dark:hover:bg-[#333c44] transition-all">
                                        Member <ChevronDown size={14} className="opacity-40" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => toast.success('Sending board invitation...')}
                                    className="px-8 py-3 bg-[#0c66e4] text-white rounded-lg font-black text-sm hover:bg-[#0055cc] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                >
                                    Share
                                </button>
                            </div>

                            {/* Share Link Area */}
                            <div className="flex items-start gap-6 bg-gray-50 dark:bg-[#161a1d] p-6 rounded-2xl border border-[#dfe1e6] dark:border-[#333c44] border-dashed">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1d2125] flex items-center justify-center text-[#44546f] dark:text-[#b6c2cf] shadow-sm border border-[#dfe1e6] dark:border-[#333c44]">
                                    <LinkIcon size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf]">Share this board with a link</h4>
                                    <button
                                        onClick={() => toast.success('Magic link created & copied!')}
                                        className="text-xs font-black text-[#0c66e4] hover:underline"
                                    >
                                        Create link
                                    </button>
                                </div>
                            </div>

                            {/* Tabs Area */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-10 border-b-2 border-gray-100 dark:border-[#333c44]">
                                    <button className="pb-3 text-sm font-black text-[#0c66e4] border-b-4 border-[#0c66e4] -mb-0.5">
                                        Board members <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-[#333c44] rounded-md text-[10px] text-[#44546f] dark:text-[#9fadbc]">1</span>
                                    </button>
                                    <button className="pb-3 text-sm font-black text-[#44546f] dark:text-[#9fadbc] hover:text-[#172b4d] dark:hover:text-[#b6c2cf] transition-all">
                                        Join requests
                                    </button>
                                </div>

                                {/* Members List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-[#0ea5e9] text-white flex items-center justify-center font-black text-lg shadow-inner ring-2 ring-white dark:ring-[#333c44]">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] leading-tight flex items-center gap-2">
                                                    {user?.name} <span className="text-[#44546f] dark:text-gray-500 text-xs font-bold leading-none">(you)</span>
                                                </div>
                                                <div className="text-xs font-medium text-[#44546f] dark:text-[#9fadbc]">@{user?.name?.toLowerCase().replace(/\s/g, '')} • Workspace admin</div>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded-lg text-sm font-black text-[#44546f] dark:text-[#b6c2cf] transition-colors border border-transparent hover:border-[#dfe1e6] dark:hover:border-[#333c44]">
                                            Admin <ChevronDown size={14} className="opacity-40" />
                                        </button>
                                    </div>

                                    {/* Registered Users List (Filtered by query) */}
                                    {shareQuery && (
                                        <div className="pt-6 space-y-4 border-t border-gray-100 dark:border-[#333c44] animate-in slide-in-from-top-2 duration-300">
                                            <div className="text-[10px] uppercase font-black tracking-widest text-gray-400">Search Results</div>
                                            {allUsers
                                                .filter(u => u._id !== user._id && (u.name.toLowerCase().includes(shareQuery.toLowerCase()) || u.email.toLowerCase().includes(shareQuery.toLowerCase())))
                                                .map(u => (
                                                    <div key={u._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#333c44] rounded-2xl transition-all border border-transparent hover:border-[#dfe1e6] dark:hover:border-[#333c44] cursor-pointer" onClick={() => handleShareProject(u)}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] dark:text-[#5794f7] flex items-center justify-center font-black text-sm uppercase">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf]">{u.name}</div>
                                                                <div className="text-[10px] font-bold text-[#44546f] dark:text-[#9fadbc] uppercase tracking-wider">{u.email}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs font-black text-[#0c66e4] opacity-0 group-hover:opacity-100 group-hover:block transition-all mr-2">
                                                            {invitedUsers.includes(u._id) ? 'Added' : 'Add member'}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProjectBoard;
