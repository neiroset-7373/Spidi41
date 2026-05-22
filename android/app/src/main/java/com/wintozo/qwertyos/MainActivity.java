package com.wintozo.qwertyos;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.StrictMode;
import android.util.Log;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.appcompat.app.AppCompatActivity;

import java.io.File;
import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {
    
    private WebView webView;
    private ProgressBar progressBar;
    private static final String TAG = "WintoPhone";
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
        try {
            super.onCreate(savedInstanceState);
            
            // Allow network requests
            if (android.os.Build.VERSION.SDK_INT > 9) {
                StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
                StrictMode.setThreadPolicy(policy);
            }
            
            setContentView(R.layout.activity_main);
            
            Log.d(TAG, "Activity created, initializing WebView...");
            initWebView();
            checkPermissions();
            
            Log.d(TAG, "WebView initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error in onCreate: " + e.getMessage(), e);
            e.printStackTrace();
            Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
    
    private void initWebView() {
        try {
            webView = findViewById(R.id.webView);
            progressBar = findViewById(R.id.progressBar);
            
            if (webView == null) {
                Log.e(TAG, "WebView is null!");
                return;
            }
            
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
            webSettings.setMediaPlaybackRequiresUserGesture(false);
            webSettings.setAllowFileAccessFromFileURLs(false);
            webSettings.setAllowUniversalAccessFromFileURLs(false);
            webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
            webSettings.setUseWideViewPort(true);
            webSettings.setLoadWithOverviewMode(true);
            
            Log.d(TAG, "WebView settings configured");
            
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    Log.d(TAG, "Page loaded: " + url);
                    if (progressBar != null) {
                        progressBar.setVisibility(View.GONE);
                    }
                }
                
                @Override
                public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                    Log.e(TAG, "WebView error: " + description);
                }
            });
            
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onProgressChanged(WebView view, int newProgress) {
                    if (progressBar != null) {
                        progressBar.setProgress(newProgress);
                        if (newProgress == 100) {
                            progressBar.setVisibility(View.GONE);
                        } else {
                            progressBar.setVisibility(View.VISIBLE);
                        }
                    }
                }
                
                @Override
                public void onPermissionRequest(PermissionRequest request) {
                    Log.d(TAG, "Permission request: " + request.getOrigin());
                    request.grant(request.getResources());
                }
                
                @Override
                public boolean onShowFileChooser(WebView webView, 
                    ValueCallback<Uri[]> filePathCallback, 
                    FileChooserParams fileChooserParams) {
                    
                    try {
                        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                        intent.addCategory(Intent.CATEGORY_OPENABLE);
                        intent.setType("*/*");
                        
                        startActivityForResult(
                            Intent.createChooser(intent, "Выберите файл"),
                            REQUEST_FILE_PICKER
                        );
                        
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Error showing file chooser: " + e.getMessage(), e);
                        return false;
                    }
                }
            });
            
            webView.loadUrl("file:///android_asset/www/index.html");
            Log.d(TAG, "Loading URL: file:///android_asset/www/index.html");
        } catch (Exception e) {
            Log.e(TAG, "Error in initWebView: " + e.getMessage(), e);
            e.printStackTrace();
        }
    }
    
    private void checkPermissions() {
        try {
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
        } catch (Exception e) {
            Log.e(TAG, "Error checking permissions: " + e.getMessage(), e);
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
                Log.w(TAG, "Some permissions were denied");
            }
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == REQUEST_FILE_PICKER && resultCode == RESULT_OK) {
            if (data != null && data.getData() != null) {
                Uri uri = data.getData();
                handleFileSelection(uri);
            }
        }
    }
    
    private void handleFileSelection(Uri uri) {
        try {
            String mimeType = getContentResolver().getType(uri);
            Log.d(TAG, "File selected: " + uri + ", MIME: " + mimeType);
        } catch (Exception e) {
            Log.e(TAG, "Error handling file: " + e.getMessage(), e);
        }
    }
    
    @Override
    protected void onDestroy() {
        try {
            if (webView != null) {
                webView.destroy();
            }
            Log.d(TAG, "Activity destroyed");
        } catch (Exception e) {
            Log.e(TAG, "Error in onDestroy: " + e.getMessage(), e);
        }
        super.onDestroy();
    }
    
    @Override
    public void onBackPressed() {
        try {
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
            } else {
                super.onBackPressed();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in onBackPressed: " + e.getMessage(), e);
            super.onBackPressed();
        }
    }
}
