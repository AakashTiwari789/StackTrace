import ImageKit from '@imagekit/nodejs';

const imagekitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file, fileName, folder) {
    const result = await imagekitClient.files.upload({
        file: file,
        fileName: fileName + '-' + Date.now(),
        folder: folder,
    });
    return result.url;
};


export { uploadFile };