# Video Stream Troubleshooting Guide

If you're experiencing "no video stream visible" issues in PrismMeet, follow these steps to diagnose and resolve the problem.

## Quick Fixes

### 1. Check Browser Permissions
- Make sure your browser has permission to access camera and microphone
- Look for a camera/microphone icon in your browser's address bar
- Click the icon and ensure permissions are set to "Allow"

### 2. Refresh the Page
- Sometimes the video stream needs a fresh start
- Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac) for a hard refresh

### 3. Check Device Usage
- Ensure no other applications are using your camera
- Close other video conferencing apps (Zoom, Teams, etc.)
- Check if your camera is being used by other browser tabs

## Advanced Troubleshooting

### 1. Use the Video Test Page
- Click the "Test Video" button in the meeting interface
- This will open a dedicated video testing page
- Try starting video there to isolate the issue

### 2. Check Browser Console
- Open Developer Tools (F12)
- Look for error messages in the Console tab
- Common errors include:
  - `NotAllowedError`: Permission denied
  - `NotFoundError`: No camera/microphone found
  - `NotReadableError`: Device already in use

### 3. Browser Compatibility
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Update your browser to the latest version
- Try a different browser if issues persist

### 4. HTTPS Requirement
- Camera access requires HTTPS in most browsers
- Make sure you're accessing the app via `https://` not `http://`
- For local development, use `localhost` (which is considered secure)

## Common Issues and Solutions

### Issue: "Camera permission denied"
**Solution:**
1. Click the camera icon in your browser's address bar
2. Select "Allow" for camera and microphone access
3. Refresh the page

### Issue: "No camera found"
**Solution:**
1. Check if your camera is properly connected
2. Try unplugging and reconnecting your camera
3. Check Device Manager (Windows) or System Preferences (Mac)
4. Try a different USB port

### Issue: "Camera already in use"
**Solution:**
1. Close other applications using the camera
2. Check for other browser tabs using camera
3. Restart your browser
4. Restart your computer if needed

### Issue: Video appears but is black/frozen
**Solution:**
1. Check if your camera lens is covered
2. Try toggling the camera on/off in the meeting
3. Check camera settings in your operating system
4. Try a different camera if available

### Issue: Video works but audio doesn't
**Solution:**
1. Check microphone permissions
2. Ensure correct audio device is selected
3. Check system volume settings
4. Try toggling the microphone on/off

## Technical Details

### Supported Video Formats
- H.264 (recommended)
- VP8
- VP9

### Minimum Requirements
- Camera: 640x480 resolution minimum
- Frame rate: 15 FPS minimum
- Browser: Modern browser with WebRTC support

### Network Requirements
- Stable internet connection
- Minimum 1 Mbps upload/download for video
- Low latency connection for real-time communication

## Getting Help

If you're still experiencing issues:

1. **Use the Video Test Page**: Navigate to `/video-test` to test your devices independently
2. **Check Console Logs**: Open Developer Tools and look for error messages
3. **Try Different Devices**: Test with different camera/microphone combinations
4. **Contact Support**: Provide the error messages and browser information

## Debug Information

When reporting issues, include:
- Browser name and version
- Operating system
- Error messages from console
- Camera/microphone model (if known)
- Network connection type
- Steps to reproduce the issue 