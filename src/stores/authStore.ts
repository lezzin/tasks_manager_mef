import { defineStore } from "pinia";
import { ref } from "vue";
import { auth, db } from "../libs/firebase.ts";
import { deleteUser, onAuthStateChanged, signOut } from "firebase/auth";
import { PRINCIPAL_DOC_NAME } from "../utils/variables.ts";
import { deleteDoc, doc } from "firebase/firestore";

export const useAuthStore = defineStore("auth", () => {
    const user = ref(auth.currentUser);

    const initAuthListener = () => {
        onAuthStateChanged(auth, (currentUser) => {
            user.value = currentUser;
        });
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw error;
        }
    };

    const deleteAccount = async () => {
        if (!user.value || !auth.currentUser) return;

        try {
            const docRef = doc(db, PRINCIPAL_DOC_NAME, user.value.uid);
            await Promise.all([deleteDoc(docRef), deleteUser(auth.currentUser)]);
        } catch (error) {
            throw error;
        }
    };

    initAuthListener();

    return {
        user,
        logout,
        deleteAccount,
    };
});
