const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file:///tmp/cat/build/cat-a.html',{waitUntil:'networkidle'});await p.waitForTimeout(800);
await p.pdf({path:'/mnt/user-data/outputs/LUX_Residence_Menzil_planlari_kataloq.pdf',width:'210mm',height:'297mm',printBackground:true,preferCSSPageSize:true});
await b.close();})();
