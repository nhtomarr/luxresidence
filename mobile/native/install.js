// Capacitor "sync" sonrası: native zəng plugini + mikrofon icazələri (CI workflow-a toxunmadan)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const java = path.join(root, 'android/app/src/main/java/az/rahmangroup/basofis');
if (!fs.existsSync(path.join(root, 'android'))) { console.log('android yoxdur, keçildi'); process.exit(0); }
fs.mkdirSync(java, { recursive: true });
fs.copyFileSync(path.join(__dirname, 'CallAudioPlugin.java'), path.join(java, 'CallAudioPlugin.java'));
fs.copyFileSync(path.join(__dirname, 'MainActivity.java'), path.join(java, 'MainActivity.java'));
const m = path.join(root, 'android/app/src/main/AndroidManifest.xml');
let x = fs.readFileSync(m, 'utf8');
const perms = ['RECORD_AUDIO', 'MODIFY_AUDIO_SETTINGS', 'WAKE_LOCK'];
let add = '';
for (const p of perms) if (!x.includes('android.permission.' + p)) add += `    <uses-permission android:name="android.permission.${p}" />\n`;
if (!x.includes('android.hardware.microphone')) add += '    <uses-feature android:name="android.hardware.microphone" android:required="false" />\n';
if (add) { x = x.replace('</manifest>', add + '</manifest>'); fs.writeFileSync(m, x); }
console.log('Zəng plugini quraşdırıldı; icazələr:', perms.join(', '));
