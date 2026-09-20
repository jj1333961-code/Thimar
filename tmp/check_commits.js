const https = require("https");
function get(url) {
  return new Promise((resolve) => {
    https.get(url, {headers: {"User-Agent": "node"}}, res => {
      let d = ""; res.on("data", c => d += c); res.on("end", () => resolve(JSON.parse(d)));
    });
  });
}
async function run() {
  const commit19 = await get("https://api.github.com/repos/jj1333961-code/Thimar/commits/bc3893cc92255fd690d35517fa661e949c1be4dc");
  console.log("Commit 19 date:", commit19.commit?.author?.date, "message:", commit19.commit?.message);
  const commit5 = await get("https://api.github.com/repos/jj1333961-code/Thimar/commits/96fc9213d01cb26094079669fddf35fd45f311d7");
  console.log("Commit 5 date:", commit5.commit?.author?.date, "message:", commit5.commit?.message);
  const commit20 = await get("https://api.github.com/repos/jj1333961-code/Thimar/commits/47fbef852899478f68ca93fbf70ffc2ea0424564");
  console.log("Commit 20 date:", commit20.commit?.author?.date, "message:", commit20.commit?.message);
}
run();
