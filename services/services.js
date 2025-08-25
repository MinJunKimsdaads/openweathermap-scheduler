// import fetch from "node-fetch";
import fs from 'fs/promises';
import fs2 from 'fs';
import path from "path";
import ftp from 'basic-ftp';
import zlib from 'zlib';
import { OPENWEATHER_URL } from "../constant/apiContant.js";
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

export const getData = async () => {
    try{
        const jsonData = await fs.readFile('./assets/data/airport.json');
        const data = JSON.parse(jsonData);
        return data;
    }catch(e){
        console.error(e);
    }
}

export const getWeatherData = async () => {
    try{
        const result = [];
        const data = await getData();
        await Promise.all(
            data.map(async (i)=> {
                const res = await fetch(`${OPENWEATHER_URL}?lat=${i[6]}&lon=${7}&appid=${process.env.OPENWEATHER_API_KEY}`);
                const json = await res.json();
                if(json.cod !== 429){
                    result.push(json);
                }
            })
        )
        return JSON.stringify(result);
    }catch(e){
        console.error(e);
    }
}

const uploadToSFTP = async (localPath, filename) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: process.env.SFTP_HOST,
            user: process.env.SFTP_USERNAME,
            password: process.env.SFTP_PASSWORD,
            port: process.env.SFTP_PORT,
            secure: false, // FTPS가 아닌 경우 false
        });
        const remotePath = path.posix.join(process.env.SFTP_PATH, filename);
        await client.uploadFrom(localPath, remotePath);
        // console.log('FTP 업로드 성공');
        await client.cd(process.env.SFTP_PATH);
        const list = await client.list();
        if(list.length > 1){
            const files = list
            .sort((a, b) => {
                const aTime = parseInt(a.name.replace('.json.gz', ''));
                const bTime = parseInt(b.name.replace('.json.gz', ''));
                return bTime - aTime;
            });
            const filesToDelete = list.slice(100);
            for (const file of filesToDelete) {
                await client.remove(file.name);
            }
        }
    } catch(err){
        console.error(err);
    } finally{
        client.close();
    }
}

export const saveJsonTempAndUpload = async () => {
    try{
        const data = await getWeatherData();
        if(data.length < 3){
            throw new Error('❌');
        }
    
        const time = Date.now();
        const filename = `${time}.json.gz`; // 확장자 변경
        const tempDir = './temp';
        fs2.mkdirSync(tempDir, { recursive: true });

        const localPath = path.resolve(tempDir, filename);
        // JSON → gzip 압축하여 저장
        const jsonString = JSON.stringify(data, null, 2);
        const gzip = zlib.createGzip();
        const writeStream = fs2.createWriteStream(localPath);
        const readStream = Readable.from([jsonString]);

        await new Promise((resolve, reject) => {
            readStream
                .pipe(gzip)
                .pipe(writeStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        await uploadToSFTP(localPath, filename);

        // 업로드 후 파일 삭제
        try {
            fs2.unlinkSync(localPath);
            console.log(`🧹 임시 파일 삭제 완료: ${localPath}`);
        } catch (deleteErr) {
            console.error(`❌ 임시 파일 삭제 실패: ${localPath}`, deleteErr);
        }

    }catch(e){
        console.error(e);
    }
}


