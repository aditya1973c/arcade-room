"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import styles from './page.module.css';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { profile, updateProfile, deleteAccount } = useProfile();
  
  const [activeTab, setActiveTab] = useState('editProfile'); // 'editProfile', 'changeUsername', 'deleteAccount'
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [usernameStep, setUsernameStep] = useState(1);
  const [newHandle, setNewHandle] = useState('');
  const [usernameSaved, setUsernameSaved] = useState(false);

  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [dob, setDob] = useState(profile.dob || '14/01/2005');
  const [bio, setBio] = useState(profile.bio || '');
  const [instagram, setInstagram] = useState(profile.instagram || '');
  const [twitter, setTwitter] = useState(profile.twitter || '');
  const [youtube, setYoutube] = useState(profile.youtube || '');
  
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  useEffect(() => {
    if (usernameSaved) {
      const timer = setTimeout(() => setUsernameSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [usernameSaved]);

  const handleProceedUsername = () => {
    setNewHandle(profile.username || '');
    setUsernameStep(2);
  };

  const handleSaveUsername = () => {
    updateProfile({ username: newHandle });
    setUsernameStep(1);
    setUsernameSaved(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (!deleteChecked) return;
    const res = await deleteAccount();
    if (res.success) {
      router.push('/');
    } else {
      // Firebase requires recent login for account deletion
      if (res.error.includes('requires-recent-login')) {
        setDeleteError('Please log out and log back in to verify your identity before deleting your account.');
      } else {
        setDeleteError(res.error);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    const initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase();
    
    updateProfile({
      firstName,
      lastName,
      name: fullName,
      initials,
      dob,
      bio,
      instagram,
      twitter,
      youtube,
      avatarUrl
    });
    setIsSaved(true);
  };

  return (
    <main className={styles.settingsLayout}>
      {/* Left Sidebar Menu */}
      <aside className={styles.settingsSidebar}>
        <h2 className={styles.sidebarTitle}>Settings</h2>
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'editProfile' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('editProfile')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Edit profile</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'changeUsername' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('changeUsername')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Change Username</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'deleteAccount' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('deleteAccount')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete Account</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.chevron}><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <section className={styles.settingsContent}>
        {activeTab === 'editProfile' && (
          <div className={styles.settingsCard}>
            <h1 className={styles.pageTitle}>Edit Profile</h1>
            
            <div className={styles.avatarSection}>
              <div className={styles.avatarCircle} style={avatarUrl ? { background: `url(${avatarUrl}) center/cover` } : {}}>
                {!avatarUrl && profile.initials}
              </div>
              <div className={styles.avatarText}>
                <h3>Profile photo</h3>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                  Upload a new profile photo
                </button>
              </div>
            </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroupRow}>
              <label>First name</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className={styles.inputField} 
              />
            </div>

            <div className={styles.formGroupRow}>
              <label>Last name</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className={styles.inputField} 
              />
            </div>

            <div className={styles.formGroupRow}>
              <label>Date of birth</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  className={styles.inputField} 
                  placeholder="DD/MM/YYYY"
                />
                <p className={styles.helperText}>This won't be shown publicly. Enter in DD/MM/YYYY format.</p>
              </div>
            </div>

            <div className={styles.formGroupRow}>
              <label>Bio</label>
              <div className={styles.inputWrapper}>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className={styles.textareaField} 
                  placeholder="Tell us about yourself"
                ></textarea>
                <p className={styles.helperText}>Write a short bio to tell people more about yourself.</p>
              </div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Social Links</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroupRow}>
              <label>Instagram</label>
              <input 
                type="text" 
                value={instagram} 
                onChange={(e) => setInstagram(e.target.value)} 
                className={styles.inputField} 
                placeholder="@ username or paste Instagram profile URL"
              />
            </div>

            <div className={styles.formGroupRow}>
              <label>X / Twitter</label>
              <input 
                type="text" 
                value={twitter} 
                onChange={(e) => setTwitter(e.target.value)} 
                className={styles.inputField} 
                placeholder="@ username or paste X/Twitter profile URL"
              />
            </div>

            <div className={styles.formGroupRow}>
              <label>YouTube</label>
              <input 
                type="text" 
                value={youtube} 
                onChange={(e) => setYoutube(e.target.value)} 
                className={styles.inputField} 
                placeholder="@ username or paste YouTube channel URL"
              />
            </div>
          </div>

            <div className={styles.formActions}>
              {isSaved && <span className={styles.savedMessage}>Changes saved successfully!</span>}
              <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === 'changeUsername' && (
          <div className={styles.settingsCard}>
            <h1 className={styles.pageTitle}>Change Username</h1>
            <ul className={styles.bulletList}>
              <li>Users with an active strike can't change their username.</li>
              <li>Usernames can only be changed once every 30 days.</li>
            </ul>
            
            {usernameSaved && <div className={styles.savedMessage} style={{marginBottom: '1rem'}}>Username changed successfully!</div>}
            
            {usernameStep === 1 ? (
              <>
                <h3 className={styles.stepTitle}>STEP 1</h3>
                
                <div className={styles.formGroupCol}>
                  <label>Current Username</label>
                  <input 
                    type="text" 
                    value={profile.username || ''} 
                    readOnly
                    className={`${styles.inputField} ${styles.readOnlyInput}`} 
                  />
                </div>
                
                <button className={styles.proceedBtn} onClick={handleProceedUsername}>Proceed</button>
              </>
            ) : (
              <>
                <h3 className={styles.stepTitle}>STEP 2</h3>
                
                <div className={styles.formGroupCol}>
                  <label>New Username</label>
                  <div style={{position: 'relative'}}>
                    <span style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)'}}>@</span>
                    <input 
                      type="text" 
                      value={newHandle} 
                      onChange={(e) => setNewHandle(e.target.value)}
                      className={styles.inputField} 
                      style={{paddingLeft: '2rem'}}
                    />
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                  <button className={styles.proceedBtn} onClick={handleSaveUsername}>Save Username</button>
                  <button className={styles.proceedBtn} style={{background: '#333', color: 'white'}} onClick={() => setUsernameStep(1)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'deleteAccount' && (
          <div className={styles.settingsCard}>
            <h1 className={styles.pageTitle} style={{marginBottom: '0.5rem'}}>Delete Your Account</h1>
            <p className={styles.subtitle}>Before continuing, please review what happens next.</p>
            
            <div className={styles.deleteWarningBox}>
              <div className={styles.warningItem}>
                <div className={`${styles.warningIcon} ${styles.iconRed}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </div>
                <div>
                  <h4>Permanent Data Removal</h4>
                  <p>Your profile, ratings, watchlists, and preferences will be erased and cannot be recovered</p>
                </div>
              </div>
              
              <div className={styles.warningItem}>
                <div className={`${styles.warningIcon} ${styles.iconPurple}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h4>30 Day Delete Window</h4>
                  <p>Your account will be scheduled for deletion and permanently removed after 30 days</p>
                </div>
              </div>
              
              <div className={styles.warningItem}>
                <div className={`${styles.warningIcon} ${styles.iconBlue}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.26l5.08 5.08"></path></svg>
                </div>
                <div>
                  <h4>Change Your Mind?</h4>
                  <p>You can log in anytime during the next 30 days and cancel the deletion</p>
                </div>
              </div>
              
              <div className={styles.warningItem} style={{borderBottom: 'none'}}>
                <div className={`${styles.warningIcon} ${styles.iconBrown}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                </div>
                <div>
                  <h4>Active Account Restriction</h4>
                  <p>Accounts currently under active strike cannot be deleted until the strike ends</p>
                </div>
              </div>
            </div>
            
            <div className={styles.deleteFooter}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={deleteChecked}
                  onChange={(e) => setDeleteChecked(e.target.checked)}
                  className={styles.checkbox}
                />
                I understand that my account and data will be permanently deleted
              </label>
              
              <button 
                className={`${styles.proceedDeleteBtn} ${deleteChecked ? styles.proceedDeleteBtnActive : ''}`}
                disabled={!deleteChecked}
                onClick={handleDeleteAccount}
              >
                Proceed to Delete
              </button>
              {deleteError && (
                <div style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>
                  {deleteError}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
