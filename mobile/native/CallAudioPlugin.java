package az.rahmangroup.basofis;

import android.content.Context;
import android.media.AudioDeviceInfo;
import android.media.AudioManager;
import android.os.Build;
import android.os.PowerManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;

/** Zəng səsi: qulaqlıq (earpiece) / dinamik + yaxınlıq sensoru ilə ekranın sönməsi */
@CapacitorPlugin(name = "CallAudio")
public class CallAudioPlugin extends Plugin {
    private PowerManager.WakeLock prox;

    private AudioManager am() { return (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE); }

    private void route(boolean speaker) {
        AudioManager a = am();
        a.setMode(AudioManager.MODE_IN_COMMUNICATION);
        if (Build.VERSION.SDK_INT >= 31) {
            int want = speaker ? AudioDeviceInfo.TYPE_BUILTIN_SPEAKER : AudioDeviceInfo.TYPE_BUILTIN_EARPIECE;
            List<AudioDeviceInfo> devs = a.getAvailableCommunicationDevices();
            AudioDeviceInfo pick = null;
            // qulaqlıq/bluetooth qoşuludursa onu üstün tut
            for (AudioDeviceInfo d : devs) {
                int t = d.getType();
                if (t == AudioDeviceInfo.TYPE_WIRED_HEADSET || t == AudioDeviceInfo.TYPE_WIRED_HEADPHONES || t == AudioDeviceInfo.TYPE_BLUETOOTH_SCO || t == AudioDeviceInfo.TYPE_USB_HEADSET || (Build.VERSION.SDK_INT >= 31 && t == AudioDeviceInfo.TYPE_BLE_HEADSET)) { if (!speaker) { pick = d; break; } }
            }
            if (pick == null) for (AudioDeviceInfo d : devs) if (d.getType() == want) { pick = d; break; }
            if (pick != null) a.setCommunicationDevice(pick);
        } else {
            a.setSpeakerphoneOn(speaker);
        }
        proximity(!speaker);
    }

    private void proximity(boolean on) {
        try {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            if (on) {
                if (prox == null && pm.isWakeLockLevelSupported(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK))
                    prox = pm.newWakeLock(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK, "basofis:call");
                if (prox != null && !prox.isHeld()) prox.acquire(4 * 60 * 60 * 1000L);
            } else if (prox != null && prox.isHeld()) {
                prox.release();
            }
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void start(PluginCall call) {
        boolean speaker = call.getBoolean("speaker", false);
        getActivity().runOnUiThread(() -> { try { route(speaker); } catch (Exception ignored) {} });
        JSObject r = new JSObject(); r.put("ok", true); r.put("speaker", speaker); call.resolve(r);
    }

    @PluginMethod
    public void setSpeaker(PluginCall call) { start(call); }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                AudioManager a = am();
                if (Build.VERSION.SDK_INT >= 31) a.clearCommunicationDevice(); else a.setSpeakerphoneOn(false);
                a.setMode(AudioManager.MODE_NORMAL);
            } catch (Exception ignored) {}
            proximity(false);
        });
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() { proximity(false); }
}
