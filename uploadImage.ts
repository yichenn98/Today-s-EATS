import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImage(uid: string, file: File) {
  const storage = getStorage();
  const imageRef = ref(storage, `users/${uid}/${Date.now()}.jpg`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
}
