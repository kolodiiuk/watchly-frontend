import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../auth/services/AuthProvider.tsx';
import {
  useChangePasswordMutation,
  useChangeUsernameMutation,
  useUpdateProfilePictureMutation,
} from '../../../app/api/usersApi.ts';
import { useDispatch } from 'react-redux';
import { setNewUserName } from '../../auth/services/authSlice.ts';

export function ProfilePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.userName ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profilePictureMessage, setProfilePictureMessage] = useState<string | null>(null);
  const [changeUserName] = useChangeUsernameMutation();
  const [changePassword] = useChangePasswordMutation();
  const [updateProfilePicture] = useUpdateProfilePictureMutation();
  const dispatch = useDispatch();

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMessage(null);
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setUsernameMessage('Username is required.');
      return;
    }

    try {
      await changeUserName({ name: trimmedUsername }).unwrap();
      dispatch(setNewUserName(trimmedUsername));
      setUsernameMessage('Username updated.');
    } catch {
      setUsernameMessage('Could not update username.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!oldPassword.trim() || !newPassword.trim()) {
      setPasswordMessage('Old and new password are required.');
      return;
    }

    try {
      await changePassword({ oldPassword: oldPassword.trim(), newPassword: newPassword.trim() }).unwrap();
      setOldPassword('');
      setNewPassword('');
      setPasswordMessage('Password updated.');
    } catch {
      setPasswordMessage('Could not update password.');
    }
  };

  const handleUpdateProfilePicture = async (e: React.FormEvent) => {
    e.preventDefault();

    setProfilePictureMessage(null);
    if (!profilePicture) {
      setProfilePictureMessage('Select an image first.');
      return;
    }

    try {
      await updateProfilePicture(profilePicture).unwrap();
      setProfilePicture(null);
      setProfilePictureMessage('Profile picture updated.');
    } catch {
      setProfilePictureMessage('Could not update profile picture.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Change Username</h2>
        <form onSubmit={handleChangeUsername} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button type="submit">Update Username</Button>
          {usernameMessage ? <p className="text-sm text-muted">{usernameMessage}</p> : null}
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button type="submit">Update Password</Button>
          {passwordMessage ? <p className="text-sm text-muted">{passwordMessage}</p> : null}
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Update Profile Picture</h2>
        <form onSubmit={handleUpdateProfilePicture} className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-1 file:text-background file:font-semibold"
            />
          </div>
          <Button type="submit" disabled={!profilePicture}>
            Upload Picture
          </Button>
          {profilePictureMessage ? <p className="text-sm text-muted">{profilePictureMessage}</p> : null}
        </form>
      </Card>
    </div>
  );
}
