import type { AppUser } from './firebaseStore';

let currentUser: AppUser | null = null;

export const sessionStore = {
  setUser(user: AppUser) {
    currentUser = user;
  },
  getUser() {
    return currentUser;
  },
  updateUser(user: AppUser) {
    currentUser = user;
  },
  clear() {
    currentUser = null;
  },
};
