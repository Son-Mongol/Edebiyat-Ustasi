package com.edebiyat.app; // Sizin gerçek paket isminizle %100 eşitlendi!

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // FİZİKSEL GERİ TUŞUNU WEB GÖRÜNÜMÜNE BAĞLAR VE ÇÖKMELERİ ÖNLER
    @Override
    public void onBackPressed() {
        if (this.getBridge() != null && this.getBridge().getWebView() != null && this.getBridge().getWebView().canGoBack()) {
            this.getBridge().getWebView().goBack(); // Oyun içi ekranlarda geri git
        } else {
            super.onBackPressed(); // Oyunun en başındaysa uygulamadan çık
        }
    }
}