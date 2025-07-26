import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut as firebaseSignOut,
    User as FirebaseUser,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';
import { emailService } from './emailService';

const googleProvider = new GoogleAuthProvider();

// Helper to get or create a user profile in Firestore
const manageUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        // New user (likely from Google Sign-In)
        const email = firebaseUser.email!;
        const nameParts = firebaseUser.displayName?.split(' ') || ['User', ''];
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const newUserProfile = {
            uid: firebaseUser.uid,
            email,
            firstName,
            lastName,
            createdAt: serverTimestamp(),
        };
        await setDoc(userRef, newUserProfile);
        return newUserProfile;
    } else {
        // Existing user
        const data = userDoc.data();
        return {
            uid: data.uid,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
        };
    }
};

export const authService = {
    signIn: async (email: string, password: string): Promise<User> => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return manageUserProfile(userCredential.user);
    },
    
    googleSignIn: async (): Promise<User> => {
        const result = await signInWithPopup(auth, googleProvider);
        return manageUserProfile(result.user);
    },

    signUp: async (data: { email: string; firstName: string; lastName: string; password?: string }): Promise<void> => {
        if (!data.password) throw new Error("Password is required for signup.");

        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const { user } = userCredential;

        // Create user profile in Firestore
        const userProfile = {
            uid: user.uid,
            email: user.email!,
            firstName: data.firstName,
            lastName: data.lastName,
            createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', user.uid), userProfile);
        
        // Clean up the OTP after successful sign-up
        try {
            await deleteDoc(doc(db, 'otps', data.email));
        } catch (error) {
            console.warn(`Failed to clean up OTP for ${data.email}. This can be ignored.`, error);
        }
        
        return userProfile;
    },

    signOut: async (): Promise<void> => {
        await firebaseSignOut(auth);
    },
    
    sendOtp: async (email: string, purpose: string): Promise<void> => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in Firestore instead of localStorage for better security
        const otpStore = {
            email,
            otp,
            expires: Date.now() + 5 * 60 * 1000, // 5 minute expiry
        };
        await setDoc(doc(db, 'otps', email), otpStore);
        
        await emailService.sendOtpEmail(email, otp, purpose);
    },
    
    verifyOtp: async (email: string, otp: string): Promise<boolean> => {
        // Verify against Firestore
        const otpRef = doc(db, 'otps', email);
        const otpDoc = await getDoc(otpRef);

        if (!otpDoc.exists()) {
            throw new Error('No OTP request found. Please request a new one.');
        }

        const otpStore = otpDoc.data();
        if (otpStore.otp !== otp) {
            throw new Error('The OTP is incorrect.');
        }
        if (Date.now() > otpStore.expires) {
            throw new Error('The OTP has expired. Please request a new one.');
        }

        // OTP is valid. Do NOT delete it here. 
        // The final action (signUp) is responsible for cleanup.
        return true;
    },
    
    sendPasswordResetEmail: async (email: string): Promise<void> => {
        await sendPasswordResetEmail(auth, email);
    },
};