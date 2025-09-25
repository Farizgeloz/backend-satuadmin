'use strict';

const sharp = require('sharp');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const Dotenv = require('dotenv');
const Config = require('../config');

Dotenv.config();

const BUCKET = Config.MINIO_BUCKET || 'file-minio';
console.log(`📦 Using bucket: ${BUCKET}`);


// Konfigurasi S3Client untuk MinIO
const s3Client = new S3Client({
    region: 'us-east-1',             // MinIO tidak pakai region, tapi wajib diisi
    endpoint: Config.MINIO_URL || 'http://127.0.0.1:9000',
    forcePathStyle: true,            // wajib untuk MinIO
    credentials: {
        accessKeyId: Config.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: Config.MINIO_SECRET_KEY || 'minioadmin'
    }
});

// ✅ Pastikan bucket tersedia
const ensureBucketExists = async (bucket = BUCKET) => {
    try {
        // S3 tidak punya bucketExists, kita pakai listBuckets
        const data = await s3Client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));
        console.log(`✅ Bucket ${bucket} exists`);
    }
    catch (err) {
        if (err.name === 'NoSuchBucket') {
            // Create bucket
            await s3Client.send(new PutObjectCommand({ Bucket: bucket }));
            console.log(`✅ Bucket ${bucket} created`);
        }
        else {
            throw err;
        }
    }
};

// ✅ Upload file
const uploadFile2 = async (buffer, key, mimetype, bucket = BUCKET) => {
    await ensureBucketExists(bucket);
    console.log('🚀 Upload params:', {
        bucket: BUCKET,
        key,
        type: mimetype,
        isBuffer: buffer
    });

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype
    });

    await s3Client.send(command);
    return { key };
};

// eslint-disable-next-line @hapi/scope-start
const uploadFile = async (buffer, key, mimetype, bucket = BUCKET) => {
    await ensureBucketExists(bucket);

    console.log('🚀 Upload params:', { bucket, key, type: mimetype });

    let finalBuffer = buffer;
    let finalMime = mimetype;

    if (mimetype.startsWith('image/')) {
        if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
            finalBuffer = await sharp(buffer)
                .resize({ width: 1200, fit: 'inside', withoutEnlargement: true }) // max width 1200px
                .jpeg({ quality: 60 }) // lebih kecil
                .toBuffer();
            finalMime = 'image/jpeg';
        }
        else if (mimetype === 'image/png') {
        // 👉 kalau mau tetap PNG (dengan transparansi)
            finalBuffer = await sharp(buffer)
                .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
                .png({ compressionLevel: 9, palette: true }) // pakai palette biar kecil
                .toBuffer();
            finalMime = 'image/png';

        // 👉 atau konversi langsung ke JPEG kalau transparansi tidak penting
        // finalBuffer = await sharp(buffer)
        //   .resize({ width: 1200, fit: "inside", withoutEnlargement: true })
        //   .jpeg({ quality: 60 })
        //   .toBuffer();
        // finalMime = "image/jpeg";
        }
        else if (mimetype === 'image/webp') {
            finalBuffer = await sharp(buffer)
                .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 70 })
                .toBuffer();
            finalMime = 'image/webp';
        }
        else if (mimetype === 'image/avif') {
            finalBuffer = await sharp(buffer)
                .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
                .avif({ quality: 45 }) // turunkan quality
                .toBuffer();
            finalMime = 'image/avif';
        }
        else {
            finalBuffer = await sharp(buffer)
                .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 60 })
                .toBuffer();
            finalMime = 'image/jpeg';
        }
    }


    // 🔹 Upload ke MinIO/S3
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: finalBuffer,
        ContentType: finalMime
    });

    await s3Client.send(command);
    return { key };
};

// eslint-disable-next-line @hapi/scope-start
const uploadFileTumb = async (buffer, key, mimetype, bucket = BUCKET) => {
    await ensureBucketExists(bucket);

    console.log('🚀 Upload params:', { bucket, key, type: mimetype });

    let finalBuffer = buffer;
    let finalMime = mimetype;

    if (mimetype.startsWith('image/')) {
        if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
            // 📌 Thumbnail JPEG
            finalBuffer = await sharp(buffer)
                .resize({ width: 400, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 30 }) // hemat ukuran
                .toBuffer();
            finalMime = 'image/jpeg';

        } else if (mimetype === 'image/png') {
            // 📌 Thumbnail PNG (tetap transparansi, compress maksimal)
            finalBuffer = await sharp(buffer)
                .resize({ width: 400, fit: 'inside', withoutEnlargement: true })
                .png({ compressionLevel: 9, palette: true })
                .toBuffer();
            finalMime = 'image/png';

            // 👉 Kalau transparansi tidak penting, bisa konversi ke JPEG (lebih kecil)
            // finalBuffer = await sharp(buffer)
            //   .resize({ width: 400, fit: "inside", withoutEnlargement: true })
            //   .jpeg({ quality: 40 })
            //   .toBuffer();
            // finalMime = "image/jpeg";

        } else if (mimetype === 'image/webp') {
            // 📌 Thumbnail WebP
            finalBuffer = await sharp(buffer)
                .resize({ width: 400, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 30 })
                .toBuffer();
            finalMime = 'image/webp';

        } else if (mimetype === 'image/avif') {
            // 📌 Thumbnail AVIF
            finalBuffer = await sharp(buffer)
                .resize({ width: 400, fit: 'inside', withoutEnlargement: true })
                .avif({ quality: 30 })
                .toBuffer();
            finalMime = 'image/avif';

        } else {
            // 📌 Fallback → convert ke JPEG kecil
            finalBuffer = await sharp(buffer)
                .resize({ width: 400, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 30 })
                .toBuffer();
            finalMime = 'image/jpeg';
        }
    } else {
        console.warn('⚠️ File bukan gambar, diupload tanpa resize.');
    }

    // 🔹 Upload ke MinIO/S3
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: finalBuffer,
        ContentType: finalMime,
    });

    await s3Client.send(command);

    return { key };
};


// ✅ Download file
const downloadFile = async (key, bucket = BUCKET) => {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await s3Client.send(command);
};

// ✅ Generate presigned URL
const generatePresignedUrl = async (key, expiry = 300, bucket = BUCKET) => {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(s3Client, command, { expiresIn: expiry });
};

// Ambil dari bucket, resize, return buffer base64 atau stream
const getCompressedImage = async (key, bucket = BUCKET) => {
    try {
    // Ambil file dari S3
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const { Body } = await s3Client.send(command);

        // Konversi stream jadi buffer
        const chunks = [];
        for await (const chunk of Body) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);

        // Resize (misal max width 600px, kualitas 70%)
        const compressed = await sharp(buffer)
            .resize({ width: 600 })   // sesuaikan resolusi
            .jpeg({ quality: 40 })    // bisa pilih png/jpeg/webp
            .toBuffer();

        // Kembalikan buffer (atau convert ke base64 untuk API JSON)
        return `data:image/jpeg;base64,${compressed.toString('base64')}`;
    }
    catch (err) {
        console.error('⚠️ Gagal kompres gambar:', err);
        return null;
    }
};

// ✅ Delete file
/* const deleteFile = async (key, bucket = BUCKET) => {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await s3Client.send(command);
    return { key };
}; */

// ✅ Delete file (skip kalau tidak ada)
const deleteFile = async (key, bucket = BUCKET) => {
    try {
        await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    }
    catch (err) {
        if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
            console.warn(`⚠️ File ${key} tidak ditemukan, delete dibatalkan`);
            return { key, deleted: false };
        }

        if (err.$metadata?.httpStatusCode === 403) {
            console.error(`🚫 Tidak ada izin akses ke file ${key}. Pastikan policy ada s3:GetObject & s3:DeleteObject`);
            return { key, deleted: false, error: 'Forbidden' };
        }

        throw err;
    }

    try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        return { key, deleted: true };
    }
    catch (err) {
        if (err.$metadata?.httpStatusCode === 403) {
            console.error(`🚫 Tidak ada izin hapus file ${key}. Pastikan policy ada s3:DeleteObject`);
            return { key, deleted: false, error: 'Forbidden' };
        }

        throw err;
    }
};


// ✅ Export semua
module.exports = {
    s3Client,
    BUCKET,
    ensureBucketExists,
    uploadFile,
    uploadFileTumb,
    downloadFile,
    generatePresignedUrl,
    getCompressedImage,
    deleteFile
};
