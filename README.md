# Moodle Image Zoom with Upscaling (moodle-javascript-upscaler)

Adds a hover icon to all images in Moodle that opens an upscaled version in a fullscreen overlay. Works with both `<img>` tags and CSS `background-image` elements.

## Features

- **Hover to reveal**: Blue "+" icon appears in corner nearest to mouse
- **Click to enlarge**: Opens fullscreen overlay with upscaled image
- **Canvas upscaling**: Automatically upscales images to 2048x2048 (configurable)
- **Accessible**: High contrast icon with ARIA labels
- **Smart detection**: Works on regular images AND background-image divs
- **Auto-filters**: Ignores small images (icons, buttons)
- **No dependencies**: No Bootstrap or jQuery required

## Installation

### Method 1: Direct Code Insertion (Recommended for testing)

1. Log in as Moodle administrator
2. Navigate to: **Site administration → Appearance → Additional HTML**
3. Scroll to **"Before BODY is closed"** or **"When BODY is opened"**
4. Paste the following:

```html
<script>
// PASTE THE ENTIRE CONTENTS OF moodle-image-zoom-final.js HERE
</script>
```

**IMPORTANT:** Make sure to wrap the code in `<script>` and `</script>` tags!

5. Click **"Save changes"**
6. Clear Moodle cache: **Site administration → Development → Purge all caches**
7. Hard refresh your browser (`Ctrl+F5` or `Cmd+Shift+R`)

### Method 2: External File (Recommended for production)

1. In Moodle: **Site administration → Appearance → Additional HTML**
2. Add to **"Before BODY is closed"**:

```html
<script src="https://raw.githubusercontent.com/RVC-Learn-Digital-Team/moodle-javascript-upscaler/e0d4476ad285ebe28f17b14cb8f0fa1099062ef9/moodle-javascript-upscaler.js"></script>
```

**Note:** Replace the URL with your actual raw GitHub URL or host the file on your own server.

### Method 3: Boost Union Theme (If using Boost Union)

1. Navigate to: **Site administration → Appearance → Boost Union → Advanced settings**
2. Find the **"Raw JavaScript"** section
3. Paste the JavaScript code directly (without `<script>` tags)
4. Save changes

## Configuration

Edit the `CONFIG` object at the top of the script:

```javascript
const CONFIG = {
    minImageSize: 100,       // Minimum image size (px) to show zoom icon
    upscaleEnabled: true,    // Set to false to disable upscaling
    upscaleWidth: 2048,      // Target width for upscaling
    upscaleHeight: 2048,     // Target height for upscaling
    iconSize: 32,            // Size of the zoom icon (px)
    iconOffset: 8            // Distance from corner (px)
};
```

### To disable upscaling:

Change `upscaleEnabled: true` to `upscaleEnabled: false`

This will show the original full-size image instead of upscaling it.

### To change upscale dimensions:

Adjust `upscaleWidth` and `upscaleHeight` values. Keep aspect ratio in mind - the script maintains it automatically.

## Customization

### Change Icon Color

Find this line in the CSS:
```javascript
background: rgba(0, 102, 204, 0.85);
```

Change to your theme colors:
```javascript
background: rgba(220, 53, 69, 0.85);  // Red
background: rgba(40, 167, 69, 0.85);  // Green
background: rgba(255, 193, 7, 0.85);  // Yellow
```

### Change Icon Symbol

Find this line:
```javascript
zoomIcon.innerHTML = '+';
```

Change to:
- `'⤢'` - Expand arrow
- `'↗'` - Arrow
- Custom HTML/SVG

### Adjust Icon Size

In CONFIG:
```javascript
iconSize: 40,      // Larger icon
iconOffset: 12,    // More space from corner
```

## Troubleshooting

### Icons don't appear

1. **Clear Moodle cache**: Site administration → Development → Purge all caches
2. **Hard refresh browser**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. **Check browser console** (F12) for JavaScript errors
4. **Verify script tags**: Make sure code is wrapped in `<script></script>` tags if using Additional HTML

### Icons appear but clicking does nothing

1. Check browser console (F12) for errors
2. Verify the script loaded completely
3. Try disabling upscaling (set `upscaleEnabled: false`)

### Background images don't get icons

1. Check if the div has `style="background-image: url(...)"` attribute
2. Image must be at least 100x100 pixels
3. Check browser console for CORS errors (cross-origin images may fail to upscale)

### Images are blurry after upscaling

This is expected behavior - canvas upscaling uses interpolation. To show original quality:
- Set `upscaleEnabled: false` in CONFIG
- OR upload higher resolution images

### Small images/icons show zoom

Increase the minimum size:
```javascript
minImageSize: 150,  // Only images 150x150px or larger
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

### About Upscaling

Canvas upscaling does NOT improve image quality - it makes images larger using browser interpolation. For best results:
- Upload high-resolution images initially
- Consider disabling upscaling if images are already high quality
- Upscaling is most useful for standardizing modal image sizes

### About CORS

If images are hosted on external domains, canvas upscaling may fail due to CORS restrictions. The script will automatically fall back to showing the original image.

### About Performance

- With upscaling: 1-3 second delay when clicking icon (processing time)
- Without upscaling: Instant modal display
- Processing happens once per click, not on hover

## Accessibility Features

- High contrast blue box with white border
- Large, clear "+" symbol
- ARIA labels (`role="button"`, `aria-label="Enlarge image"`)
- Keyboard support (ESC key closes overlay)
- Screen reader friendly (close button has proper label)

## What It Works On

### Supported:
- Regular `<img>` tags
- Images with `srcset` attributes
- CSS `background-image` on divs
- Dynamically loaded content (AJAX)
- Course overview cards
- Content area images
- Forum attachments

### Filtered out:
- Small images under 100x100px (icons, buttons)
- Images already processed
- Elements without valid image URLs

## License

Free to use and modify for your Moodle installation.

## Credits

Created for Moodle with accessibility and usability in mind.
