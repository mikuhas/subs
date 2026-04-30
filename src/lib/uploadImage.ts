import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export const uploadProfileImage = async (file: File, userEmail: string): Promise<string> => {
  const safeEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_')
  const timestamp = Date.now()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `profiles/${safeEmail}/${timestamp}.${ext}`

  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
