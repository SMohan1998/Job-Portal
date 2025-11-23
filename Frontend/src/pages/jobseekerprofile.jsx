import React, { useEffect, useState } from 'react';
import API from '../services/api';

const JobSeekerProfile = () => {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    API.get('/profiles').then(res => {
      setProfile(res.data);
      setForm({
        username: res.data.username || '',
        experience: res.data.experience || '',
        education: res.data.education || '',
        skills: (res.data.skills || []).join(', '),
        contactDetails: res.data.contactDetails || '',
      });
    }).catch(err => console.error(err));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    try {
      await API.put('/profiles', form);
      setMsg('Profile updated');
      setEditing(false);
      const res = await API.get('/profiles');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setMsg('Failed to update');
    }
  };

  const handlePic = async (e) => {
    const f = e.target.files[0];
    if(!f) return;
    const fd = new FormData();
    fd.append('profilePicture', f);
    try {
      await API.post('/profiles/profile-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      const res = await API.get('/profiles');
      setProfile(res.data);
      setMsg('Profile picture uploaded');
    } catch(err) {
      console.error(err);
      setMsg('Upload failed');
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Job Seeker Profile</h2>

      <div className="flex gap-4 items-center">
        <div>
          {profile.profilePicture ? (
            <img src={`${(API.defaults.baseURL || '').replace(/\/api\/?$/, '')}/${profile.profilePicture}`}
                 alt="avatar" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">No pic</div>
          )}
          <input type="file" accept="image/*" onChange={handlePic} className="mt-2"/>
        </div>

        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      </div>

      <div className="mt-6">
        {!editing ? (
          <>
            <p><strong>Experience:</strong> {profile.experience || '—'}</p>
            <p><strong>Education:</strong> {profile.education || '—'}</p>
            <p><strong>Skills:</strong> {(profile.skills || []).join(', ') || '—'}</p>
            <p><strong>Contact:</strong> {profile.contactDetails || '—'}</p>
            <button onClick={() => setEditing(true)} className="mt-3 bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <input name="username" value={form.username} onChange={handleChange} className="p-2 border"/>
            <input name="experience" value={form.experience} onChange={handleChange} className="p-2 border" placeholder="Experience"/>
            <input name="education" value={form.education} onChange={handleChange} className="p-2 border" placeholder="Education"/>
            <input name="skills" value={form.skills} onChange={handleChange} className="p-2 border" placeholder="Comma separated"/>
            <input name="contactDetails" value={form.contactDetails} onChange={handleChange} className="p-2 border" placeholder="Contact details"/>
            <div className="flex gap-2">
              <button onClick={save} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
              <button onClick={() => setEditing(false)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="font-semibold">Resume</p>
        {profile.resume ? (
          <a href={`${(API.defaults.baseURL || '').replace(/\/api\/?$/, '')}/${profile.resume}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">View resume</a>
        ) : (
          <p>No resume uploaded</p>
        )}
        <div className="mt-2">
          <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])}/>
          <button onClick={async () => {
            if(!file) { setMsg('Select file'); return; }
            const fd = new FormData(); fd.append('resume', file);
            try {
              await API.post('/profiles/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
              const res = await API.get('/profiles');
              setProfile(res.data);
              setMsg('Resume uploaded');
            } catch(e) { console.error(e); setMsg('Upload failed'); }
          }} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">Upload</button>
        </div>
      </div>

      {msg && <p className="mt-4 text-green-600">{msg}</p>}
    </main>
  );
};

export default JobSeekerProfile;
