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

// ---- Versiya + Play imzası (release) ----
const g = path.join(root, 'android/app/build.gradle');
let b = fs.readFileSync(g, 'utf8');
const pkg = require(path.join(root, 'package.json'));
const vcode = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10) + 100;
b = b.replace(/versionCode\s+\d+/, 'versionCode ' + vcode).replace(/versionName\s+"[^"]*"/, 'versionName "' + pkg.version + '"');
if (!b.includes('signingConfigs {') ) {
  b = b.replace(/android\s*\{/, `android {
    signingConfigs {
        release {
            def ks = System.getenv("ANDROID_KEYSTORE_FILE")
            if (ks && new File(ks).exists()) {
                storeFile file(ks)
                storePassword System.getenv("ANDROID_KEYSTORE_PASS")
                keyAlias System.getenv("ANDROID_KEY_ALIAS")
                keyPassword System.getenv("ANDROID_KEY_PASS")
            }
        }
    }`);
  b = b.replace(/buildTypes\s*\{\s*release\s*\{/, m => m + '\n            if (System.getenv("ANDROID_KEYSTORE_FILE")) signingConfig signingConfigs.release');
}
fs.writeFileSync(g, b);
console.log('Versiya:', pkg.version, '(' + vcode + ')', 'imza:', process.env.ANDROID_KEYSTORE_FILE ? 'var' : 'yox');
