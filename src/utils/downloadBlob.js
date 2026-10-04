/**
 * downloadBlob – reliably saves a Blob as a file across all browsers,
 * including mobile in-app browsers (Messenger, Instagram, TikTok, etc.)
 * that silently drop anchor.download clicks.
 *
 * Strategy:
 *  1. Standard path: create object URL → hidden <a download> → click.
 *     Works in Chrome, Firefox, Safari (real browser).
 *  2. In-app browser / WebView fallback: open the blob URL in a new tab.
 *     The user can then long-press the image and tap "Save to Photos" / "Download".
 *     A toast message guides them.
 *
 * Returns { inApp: boolean } so the caller can show an appropriate message.
 */

/** Detect common in-app / WebView user-agents that block anchor downloads. */
function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return (
    // Facebook / Messenger
    /FBAN|FBAV|FB_IAB|MessengerLiteForiOS/i.test(ua) ||
    // Instagram
    /Instagram/i.test(ua) ||
    // TikTok
    /musical_ly|TikTok/i.test(ua) ||
    // Twitter / X
    /TwitterAndroid|Twitter for iPhone/i.test(ua) ||
    // Snapchat
    /Snapchat/i.test(ua) ||
    // LinkedIn
    /LinkedInApp/i.test(ua) ||
    // Generic Android WebView (non-Chrome)
    (/Android/i.test(ua) && /wv\)/.test(ua) && !/Chrome\/[0-9]/.test(ua)) ||
    // iOS WebView (no Safari keyword)
    (/iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua))
  );
}

/**
 * @param {Blob}   blob     - The file blob to save.
 * @param {string} filename - Suggested filename (e.g. "wallpaper.png").
 * @returns {{ inApp: boolean }}
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  if (isInAppBrowser()) {
    // Open in a new tab — user can long-press → Save
    window.open(url, '_blank');
    // Revoke after a generous delay so the tab can load the resource
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return { inApp: true };
  }

  // Standard download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return { inApp: false };
}
