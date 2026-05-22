package com.wintozo.qwertyos;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.graphics.Color;
import android.graphics.PixelFormat;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.appcompat.app.AppCompatActivity;

import java.io.File;
import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {
    
    private WebView webView;
    private ProgressBar progressBar;
    private static final int REQUEST_CODE_PERMISSIONS = 1001;
    private static final int REQUEST_FILE_PICKER = 1002;
    
    private String[] requiredPermissions = {
        Manifest.permission.CAMERA,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    };
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        initWebView();
        checkPermissions();
    }
    
    private void initWebView() {
        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);
        
        webView.setLayoutParams(new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Поддержка камеры в WebView
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setAllowFileAccessFromFileURLs(false);
        webSettings.setAllowUniversalAccessFromFileURLs(false);
        
        // Поддержка файловых форматов
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        
        webView.setWebViewClient(new WebViewClient());
        
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress == 100) {
                    progressBar.setVisibility(View.GONE);
                } else {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }
            
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                if (request.getOrigin().toString().contains("file://") || 
                    request.getOrigin().toString().contains("https://")) {
                    request.grant(request.getResources());
                }
            }
            
            @Override
            public boolean onShowFileChooser(WebView webView, 
                ValueCallback<Uri[]> filePathCallback, 
                FileChooserParams fileChooserParams) {
                
                ArrayList<Uri> results = new ArrayList<>();
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                
                // Поддержка аудио-форматов
                if (fileChooserParams.getAcceptTypes().length > 0) {
                    String acceptType = fileChooserParams.getAcceptTypes()[0];
                    if (acceptType.contains("audio") || acceptType.contains("mp3") || 
                        acceptType.contains("wav") || acceptType.contains("m4a")) {
                        intent.setType("audio/*");
                        intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{
                            "audio/mpeg",
                            "audio/wav",
                            "audio/x-wav",
                            "audio/mp4",
                            "audio/x-m4a",
                            "audio/m4a"
                        });
                    }
                }
                
                startActivityForResult(
                    Intent.createChooser(intent, "Выберите файл"),
                    REQUEST_FILE_PICKER
                );
                
                return true;
            }
        });
        
        webView.loadUrl("file:///android_asset/www/index.html");
    }
    
    private void checkPermissions() {
        ArrayList<String> permissionsNeeded = new ArrayList<>();
        
        for (String permission : requiredPermissions) {
            if (ContextCompat.checkSelfPermission(this, permission) 
                != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(permission);
            }
        }
        
        if (!permissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                permissionsNeeded.toArray(new String[0]),
                REQUEST_CODE_PERMISSIONS
            );
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, 
        String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            
            if (!allGranted) {
                // Перезапрос при необходимости
                checkPermissions();
            }
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == REQUEST_FILE_PICKER && resultCode == RESULT_OK) {
            if (data != null && data.getData() != null) {
                Uri uri = data.getData();
                // Обработка выбранного файла
                handleFileSelection(uri);
            }
        }
    }
    
    private void handleFileSelection(Uri uri) {
        try {
            String mimeType = getContentResolver().getType(uri);
            if (mimeType != null && (
                mimeType.contains("audio/mpeg") ||
                mimeType.contains("audio/wav") ||
                mimeType.contains("audio/x-wav") ||
                mimeType.contains("audio/mp4") ||
                mimeType.contains("audio/x-m4a") ||
                mimeType.contains("audio/m4a")
            )) {
                // Файл принят
                String filePath = uri.getPath();
                if (filePath != null) {
                    File file = new File(filePath);
                    if (file.exists()) {
                        // Файл готов к использованию
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
