import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mail, MapPin, Briefcase, Link as LinkIcon, Globe, Phone, Plus, X, Check, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SectionHeader, Tag, LoadingSpinner } from '../components/ui/Cards';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    title: user?.title || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    website: user?.website || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    skills: user?.skills || [],
    experience: user?.experience || [],
    education: user?.education || []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        title: user.title || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        skills: user.skills || [],
        experience: user.experience || [],
        education: user.education || []
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size too large (max 2MB)');
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setLoading(true);
      try {
        const { data } = await api.put('/auth/avatar', { avatar: base64String });
        setUser({ ...user, avatar: data.user.avatar });
        toast.success('Profile picture updated!');
      } catch (err) {
        toast.error('Failed to update image');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', formData);
      setUser({ ...user, ...data.user });
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const glassClass = theme === 'dark' 
    ? 'bg-white/5 border-white/5 shadow-2xl' 
    : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40';

  const inputClass = `w-full bg-transparent border-b-2 py-2 text-sm font-medium outline-none transition-all
    ${theme === 'dark' 
      ? 'border-white/10 text-white focus:border-[#00E5FF]' 
      : 'border-gray-100 text-[#05051a] focus:border-[#00E5FF]'}`;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Profile Header Card */}
      <div className={`relative rounded-[3rem] overflow-hidden border transition-all duration-300 ${glassClass}`}>
        <div className="h-48 w-full bg-gradient-to-r from-[#00E5FF] via-[#6366f1] to-[#8b5cf6] opacity-20" />
        <div className="px-10 pb-10 -mt-16 flex flex-col md:flex-row gap-8 items-end">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] border-4 border-[#06061c] overflow-hidden shadow-2xl bg-[#16161e] flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-4xl font-black text-[#00E5FF]">{user?.name?.[0]}</span>
              )}
              {loading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <LoadingSpinner size={24} />
                </div>
              )}
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#00E5FF] text-[#06061c] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Camera size={18} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>{user?.name}</h1>
                <p className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.2em] mt-1">{user?.title || 'Add professional title'}</p>
              </div>
              <button 
                onClick={() => editing ? handleSave() : setEditing(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${editing 
                    ? 'bg-[#10b981] text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-[#00E5FF] text-[#06061c] shadow-[0_10px_20px_rgba(0,229,255,0.25)] hover:scale-[1.02]'}`}
              >
                {loading ? <LoadingSpinner size={14} /> : editing ? <Check size={14} /> : <Edit3 size={14} />}
                {editing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        <div className={`px-10 py-8 border-t flex flex-wrap gap-6 ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-gray-50 bg-gray-50/30'}`}>
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-gray-400" />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>{user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>{user?.location || 'Add location'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-gray-400" />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio Section */}
          <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
            <SectionHeader title="Professional Summary" subtitle="A brief overview of your professional journey" />
            {editing ? (
              <textarea 
                className={inputClass}
                rows={4}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell the world about your expertise..."
              />
            ) : (
              <p className={`text-sm font-medium leading-relaxed ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                {user?.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
            <SectionHeader title="Core Competencies" subtitle="Verified skills and technologies" />
            <div className="flex flex-wrap gap-3">
              {(formData.skills || []).map((skill, index) => (
                <div key={index} className="group relative">
                  <Tag color="#00E5FF">{skill}</Tag>
                  {editing && (
                    <button 
                      onClick={() => setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) })}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform"
                    >
                      <X size={8} />
                    </button>
                  )}
                </div>
              ))}
              {editing && (
                <button 
                  onClick={() => {
                    const skill = prompt('Enter new skill:');
                    if (skill) setFormData({ ...formData, skills: [...formData.skills, skill] });
                  }}
                  className={`px-3 py-1 rounded-lg border-2 border-dashed text-[10px] font-black uppercase tracking-widest transition-all
                    ${theme === 'dark' ? 'border-white/10 text-white/30 hover:text-white' : 'border-gray-100 text-gray-300 hover:text-[#00E5FF]'}`}
                >
                  <Plus size={10} className="inline mr-1" /> Add Skill
                </button>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
            <SectionHeader 
              title="Experience" 
              subtitle="Professional history and achievements" 
              action={editing && (
                <button 
                  onClick={() => setFormData({ 
                    ...formData, 
                    experience: [...formData.experience, { title: '', company: '', duration: '', description: '' }] 
                  })}
                  className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center hover:bg-[#00E5FF]/20"
                >
                  <Plus size={16} />
                </button>
              )}
            />
            <div className="space-y-6">
              {(formData.experience || []).map((exp, index) => (
                <div key={index} className={`relative p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  {editing && (
                    <button 
                      onClick={() => setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== index) })}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        className={inputClass} 
                        placeholder="Job Title" 
                        value={exp.title} 
                        onChange={e => {
                          const newExp = [...formData.experience];
                          newExp[index].title = e.target.value;
                          setFormData({ ...formData, experience: newExp });
                        }}
                      />
                      <input 
                        className={inputClass} 
                        placeholder="Company" 
                        value={exp.company} 
                        onChange={e => {
                          const newExp = [...formData.experience];
                          newExp[index].company = e.target.value;
                          setFormData({ ...formData, experience: newExp });
                        }}
                      />
                      <input 
                        className={inputClass} 
                        placeholder="Duration (e.g. 2021 - Present)" 
                        value={exp.duration} 
                        onChange={e => {
                          const newExp = [...formData.experience];
                          newExp[index].duration = e.target.value;
                          setFormData({ ...formData, experience: newExp });
                        }}
                      />
                      <textarea 
                        className={`${inputClass} col-span-2`} 
                        placeholder="Description" 
                        value={exp.description} 
                        onChange={e => {
                          const newExp = [...formData.experience];
                          newExp[index].description = e.target.value;
                          setFormData({ ...formData, experience: newExp });
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{exp.title}</h4>
                      <p className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest mt-1">{exp.company} • {exp.duration}</p>
                      <p className={`text-xs mt-3 leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>{exp.description}</p>
                    </>
                  )}
                </div>
              ))}
              {formData.experience?.length === 0 && !editing && (
                <p className="text-xs text-gray-500 italic">No experience added yet.</p>
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
            <SectionHeader 
              title="Education" 
              subtitle="Academic qualifications" 
              action={editing && (
                <button 
                  onClick={() => setFormData({ 
                    ...formData, 
                    education: [...formData.education, { degree: '', institution: '', year: '' }] 
                  })}
                  className="w-8 h-8 rounded-lg bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center hover:bg-[#6366f1]/20"
                >
                  <Plus size={16} />
                </button>
              )}
            />
            <div className="space-y-4">
              {(formData.education || []).map((edu, index) => (
                <div key={index} className={`relative p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  {editing && (
                    <button 
                      onClick={() => setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) })}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        className={inputClass} 
                        placeholder="Degree" 
                        value={edu.degree} 
                        onChange={e => {
                          const newEdu = [...formData.education];
                          newEdu[index].degree = e.target.value;
                          setFormData({ ...formData, education: newEdu });
                        }}
                      />
                      <input 
                        className={inputClass} 
                        placeholder="Institution" 
                        value={edu.institution} 
                        onChange={e => {
                          const newEdu = [...formData.education];
                          newEdu[index].institution = e.target.value;
                          setFormData({ ...formData, education: newEdu });
                        }}
                      />
                      <input 
                        className={inputClass} 
                        placeholder="Year" 
                        value={edu.year} 
                        onChange={e => {
                          const newEdu = [...formData.education];
                          newEdu[index].year = e.target.value;
                          setFormData({ ...formData, education: newEdu });
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{edu.degree}</h4>
                      <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-widest mt-1">{edu.institution} • {edu.year}</p>
                    </>
                  )}
                </div>
              ))}
              {formData.education?.length === 0 && !editing && (
                <p className="text-xs text-gray-500 italic">No education history added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
            <SectionHeader title="Connect" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <Globe size={16} className="text-[#00E5FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">LinkedIn</p>
                  {editing ? (
                    <input className={inputClass} value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} />
                  ) : (
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{user?.linkedin || 'Not linked'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <Globe size={16} className="text-[#00E5FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">GitHub</p>
                  {editing ? (
                    <input className={inputClass} value={formData.github} onChange={e => setFormData({ ...formData, github: e.target.value })} />
                  ) : (
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{user?.github || 'Not linked'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <Globe size={16} className="text-[#00E5FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Portfolio</p>
                  {editing ? (
                    <input className={inputClass} value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                  ) : (
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{user?.website || 'Add website'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
