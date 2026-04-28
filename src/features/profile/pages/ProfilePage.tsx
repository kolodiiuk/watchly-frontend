import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../auth/services/AuthProvider.tsx';
import {useChangeUsernameMutation} from "../../../app/api/usersApi.ts";
import {useDispatch} from "react-redux";
import {setNewUserName} from "../../auth/services/authSlice.ts";

export function ProfilePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.userName ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [changeUserName] = useChangeUsernameMutation();
  const dispatch = useDispatch();

  const handleChangeUsername = (e: React.FormEvent) => {
    e.preventDefault();
    changeUserName({ name: username }).then(() => {
      dispatch(setNewUserName(username));
    }).catch((err) => {
      console.log(err);
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleUpdateProfilePicture = (e: React.FormEvent) => {
    e.preventDefault();
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
        </form>
      </Card>
    </div>
  );
}
