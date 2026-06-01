import { doc, getDoc, setDoc, updateDoc, collection, query, limit, orderBy, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age?: string;
  city?: string;
  photoURL?: string;
  skills: string[]; // e.g. ["Guitar", "Coding"]
  learning: string[]; // e.g. ["Cooking", "Spanish"]
  createdAt: number;
  likes?: string[];
  passes?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  fcmToken?: string;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      ...data,
      uid,
      createdAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const uploadAvatar = async (uid: string, uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `avatars/${uid}`);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};

export const updateUserLocation = async (uid: string, location: { latitude: number; longitude: number }) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      location
    });
  } catch (error) {
    console.error("Error updating location:", error);
  }
};
export const fetchCandidates = async (currentUid: string): Promise<UserProfile[]> => {
  try {
    const userRef = doc(db, 'users', currentUid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];

    const currentUser = userSnap.data() as UserProfile;
    //TODO: remove comments before production
    //const myLikes = currentUser.likes || [];
    //const myPasses = currentUser.passes || [];
    //const seenUids = [...myLikes, ...myPasses, currentUid];

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(query(usersRef, limit(500))); // Fetch a larger pool for better sorting

    const candidates: (UserProfile & { matchScore: number; random: number })[] = [];
    snapshot.forEach(doc => {
      const userData = doc.data() as UserProfile;
      //TODO: remove comments before production
      if (/*!seenUids.includes(userData.uid)*/userData.uid !== currentUid) {
        let score = 0;
        const mySkills = currentUser.skills || [];
        const myLearning = currentUser.learning || [];
        const theirSkills = userData.skills || [];
        const theirLearning = userData.learning || [];

        // Scored by mutual interest:
        // +5 if I can strictly teach them what they want to learn
        mySkills.forEach(s => { if (theirLearning.includes(s)) score += 5; });
        // +5 if they can strictly teach me what I want to learn
        theirSkills.forEach(s => { if (myLearning.includes(s)) score += 5; });
        // +2 if we are learning the same thing (Shared journey)
        myLearning.forEach(s => { if (theirLearning.includes(s)) score += 2; });
        // +1 if we just have overlapping expertise (Networking)
        mySkills.forEach(s => { if (theirSkills.includes(s)) score += 1; });

        candidates.push({
            ...userData,
            matchScore: score,
            random: Math.random() // Used for stable but fresh sorting within scores
        });
      }
    });

    // Sort by matchScore (desc) then by random
    return candidates
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return b.random - a.random;
      })
      .map(({ matchScore, random, ...user }) => user);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return [];
  }
};

export const recordSwipe = async (currentUid: string, targetUid: string, action: 'like' | 'pass') => {
  try {
    const userRef = doc(db, 'users', currentUid);
    // Using arrayUnion to add to a list.
    // In production, might want a subcollection 'swipes' { targetUid, action, timestamp }
    if (action === 'like') {
      await updateDoc(userRef, {
        likes: arrayUnion(targetUid)
      });
    } else {
      await updateDoc(userRef, {
        passes: arrayUnion(targetUid)
      });
    }
  } catch (error) {
    console.error("Error recording swipe:", error);
  }
};

export const unmatchUser = async (currentUid: string, targetUid: string) => {
  try {
    const userRef = doc(db, 'users', currentUid);
    // Remove from likes and add to passes to avoid seeing them again immediately
    await updateDoc(userRef, {
      likes: arrayRemove(targetUid),
      passes: arrayUnion(targetUid)
    });
  } catch (error) {
    console.error("Error unmatching user:", error);
    throw error;
  }
};

export const checkForMatch = async (currentUid: string, targetUid: string): Promise<boolean> => {
  try {
    const targetRef = doc(db, 'users', targetUid);
    const targetSnap = await getDoc(targetRef);
    if (targetSnap.exists()) {
      const data = targetSnap.data();
      const targetLikes = data.likes || [];
      return targetLikes.includes(currentUid);
    }
    return false;
  } catch (error) {
    console.error("Error checking match:", error);
    return false;
  }
};

export const fetchMatches = async (currentUid: string): Promise<UserProfile[]> => {
  try {
    const userRef = doc(db, 'users', currentUid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];

    const userData = userSnap.data();
    const myLikes = userData.likes || [];

    const matches: UserProfile[] = [];

    await Promise.all(myLikes.map(async (likedUid: string) => {
        try {
            const isMatch = await checkForMatch(currentUid, likedUid);
            if (isMatch) {
                const profile = await getUserProfile(likedUid);
                if (profile) matches.push(profile);
            }
        } catch (e) {
            console.warn("Error checking match for", likedUid, e);
        }
    }));

    return matches;

  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

export const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
};

/** A match enriched with its conversation's most recent message (if any). */
export interface MatchSummary extends UserProfile {
  lastMessage?: string;
  lastMessageAt?: number; // epoch ms; undefined when no messages exist yet
}

/**
 * Like `fetchMatches`, but attaches the last message of each conversation so the
 * UI can split brand-new matches (no messages) from active chats and show a real
 * preview + timestamp instead of placeholder text.
 */
export const fetchMatchesWithChats = async (currentUid: string): Promise<MatchSummary[]> => {
  const matches = await fetchMatches(currentUid);

  const summaries = await Promise.all(
    matches.map(async (profile): Promise<MatchSummary> => {
      try {
        const chatId = getChatId(currentUid, profile.uid);
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const snap = await getDocs(query(messagesRef, orderBy('createdAt', 'desc'), limit(1)));

        if (snap.empty) return profile;

        const data = snap.docs[0].data();
        const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : undefined;
        return { ...profile, lastMessage: data.text, lastMessageAt: createdAt };
      } catch (e) {
        console.warn('Error loading last message for', profile.uid, e);
        return profile;
      }
    })
  );

  return summaries;
};
