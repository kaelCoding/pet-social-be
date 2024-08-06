import admin from 'firebase-admin';
// import serviceAccount from './key.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: 'pular-f3140.appspot.com',
});

const bucket = admin.storage().bucket();

export async function uploadFile(
  localFilePath: string,
  destinationFileName: string,
) {
  const options = {
    destination: destinationFileName,
  };
  await bucket.upload(localFilePath, options);
}

// const localFilePath = './vi.jpg';
// const destinationFileName = 'vi.jpg';

// uploadFile(localFilePath, destinationFileName).then(res=>{
//   console.log(res);
// }).catch(error => {
//   console.error('Error uploading file:', error);
// });

// https://firebasestorage.googleapis.com/v0/b/pular-f3140.appspot.com/o/vi.jpg?alt=media
