'use strict';

const { Client } = require('minio');
const Dotenv = require('dotenv');

Dotenv.config();

const minioClient = new Client({
    endPoint: Dotenv.MINIO_ENDPOINT || '127.0.0.1',
    port: parseInt(Dotenv.MINIO_PORT || '9000'),
    useSSL: false,
    accessKey: Dotenv.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: Dotenv.MINIO_SECRET_KEY || 'minioadmin'
});

const minioBucket = process.env.MINIO_BUCKET || 'file-minio';


// ✅ Pastikan bucket tersedia
const ensureBucketExists = async (bucket = minioBucket) => {
    const exists = await minioClient.bucketExists(bucket);

    if (!exists) {
        await minioClient.makeBucket(bucket);
        console.log(`✅ Bucket ${bucket} created`);
    }
    else {
        console.log(`✅ Bucket ${bucket} already exists`);
    }
};


// ✅ Upload file ke bucket
const uploadFile = async (fileStream, fileName, mimetype, bucket = minioBucket) => {
    await ensureBucketExists(bucket);

    return minioClient.putObject(bucket, fileName, fileStream, {
        'Content-Type': mimetype
    });
};


// ✅ Download file dari bucket
const downloadFile = async (fileName, bucket = minioBucket) => {
    return await minioClient.getObject(bucket, fileName); // tambahkan await untuk menghindari error 'require-await'
};


// ✅ Buat URL akses sementara
const generatePresignedUrl = async (fileName, expiry = 300, bucket = minioBucket) => {
    return await minioClient.presignedGetObject(bucket, fileName, expiry);
};


// ✅ Hapus file dari bucket
const deleteFile = async (fileName, bucket = minioBucket) => {
    return await minioClient.removeObject(bucket, fileName);
};


// ✅ Export semua fungsi dan objek
module.exports = {
    minioClient,
    minioBucket,
    ensureBucketExists,
    uploadFile,
    downloadFile,
    generatePresignedUrl,
    deleteFile
};
