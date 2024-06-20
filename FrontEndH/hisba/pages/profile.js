import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from '../styles/Profile.module.css';
import withAuth from '../components/withAuth';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      axios.get(`http://localhost:8000/api/profile/${session.user.name}/`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      })
      .then(response => {
        setUser(response.data);
        setProfileImage(response.data.profile.profile_image);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          signIn('credentials'); // Re-authenticate if token expired
        }
      });
    }
  }, [session, status, router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      // Upload the image immediately after selection
      handleUpdateProfileImage(file);
    }
  };

  // Separate function to update the profile image
  const handleUpdateProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('profile_image', file);
    try {
      await axios.patch(`http://localhost:8000/api/update-profile-image/`, formData, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // No need to update user object here since we are reloading the page
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await axios.patch(`http://localhost:8000/api/update-profile/${session.user.name}/`, formData, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      setUser({...user, ...response.data});
      setEditing(false);
      router.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.profile}>
        <img src={profileImage || '/default-profile.png'} alt="Profile" className={styles.profileImage} />
        {editing ? (
          <form onSubmit={handleUpdateProfile} className={styles.editForm}>
            <input type="file" name="profileImage" onChange={handleImageChange} className={styles.inputFile} />
            <input type="text" name="username" defaultValue={user.username} required className={styles.inputText} />
            <input type="number" name="age" defaultValue={user.profile.age} required className={styles.inputText} />
            <input type="text" name="phone" defaultValue={user.profile.phone} required className={styles.inputText} />
            <input type="text" name="id_number" defaultValue={user.profile.id_number} required className={styles.inputText} />
            <button type="submit" className={styles.submitButton}>Save Changes</button>
            <button type="button" onClick={() => setEditing(false)} className={styles.cancelButton}>Cancel</button>
          </form>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className={styles.editButton}>Edit Profile</button>
            <h2 className={styles.username}>{user.username}</h2>
            <p className={styles.detail}>Age: {user.profile.age}</p>
            <p className={styles.detail}>Phone: {user.profile.phone}</p>
            <p className={styles.detail}>ID Number: {user.profile.id_number}</p>
{session?.user?.role === 'admin' &&(        <p className={styles.detail}>Role: Admin</p>)}
{session?.user?.role === 'customer' &&(        <p className={styles.detail}>Role: Customer</p>)}
{session?.user?.role === 'seller' &&(        <p className={styles.detail}>Role: Seller</p>)}

          </>
        )}
      </div>
    </div>
  );
};

export default withAuth(ProfilePage);
