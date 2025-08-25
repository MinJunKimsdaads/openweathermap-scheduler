
// //대한민국 그리드 중심좌표 가져오기

import { saveJsonTempAndUpload } from "./services/services.js";

import fs from 'fs'
import fs2 from 'fs/promises';
// //대한민국 그리드 중심좌표 가져오기

// const bbox = [124, 33, 132, 43];

// // 50km 단위 → 위도/경도로 변환
// const latStep = 0.45;  // 위도
// const lonStep = 0.55;  // 경도

// function getGridCenters(bounds, lonStep, latStep) {
//   const centers = [];
//   const [minLon, minLat, maxLon, maxLat] = bounds;

//   for (let lon = minLon; lon < maxLon; lon += lonStep) {
//     for (let lat = minLat; lat < maxLat; lat += latStep) {
//       const centerLon = lon + lonStep / 2;
//       const centerLat = lat + latStep / 2;

//       const obj = {
//         lon: centerLon,
//         lat: centerLat,
//       }

//       centers.push(obj);
//     }
//   }

//   return centers;
// }

// const centers = getGridCenters(bbox, lonStep, latStep);

// fs.writeFileSync('test.json', JSON.stringify(centers, null, 2), 'utf-8');

// const test = async () => {
//   try{
//         const jsonData = await fs2.readFile('./assets/data/airport.json');
//         const data = JSON.parse(jsonData);
//         const mainAirportData = data.filter((i)=>i[1].includes('international') || i[1].includes('International'))
//         fs.writeFileSync('test2.json', JSON.stringify(mainAirportData, null, 2), 'utf-8');
//   }catch(e){
//     console.error(e)
//   }
// }
// test();


async function main() {
  try {
    await saveJsonTempAndUpload();
    console.log('✅ 데이터 저장 성공');
  } catch (err) {
    console.error('❌ 스케줄러 실행 중 에러:', err);
    process.exit(1);  // 실패 시 종료코드 1 반환
  }
}

main();