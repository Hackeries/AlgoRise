# Ad placements with Google AdSense

Below shows how to add ad blocks to any page.

1) Ensure global script in `app/layout.tsx` head has been added (already done):

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3173433370339000" crossorigin="anonymous"></script>
```

2) Use the reusable React component `components/ads/AdSenseAd.tsx`:

```tsx
import AdSenseAd from '@/components/ads/AdSenseAd'

// Example usage inside a page or component
<AdSenseAd
  slot={'YOUR_SLOT_ID'} // replace with a valid slot id from AdSense
  format='auto'
  responsive
  className='w-full max-w-7xl mx-auto px-4'
  style={{ minHeight: 90 }}
/>
``

Notes:
- In development, ads run with `data-adtest="on"` automatically.
- Replace `YOUR_SLOT_ID` with your AdSense ad unit slot ID for each placement. Currently placeholders (`0000000000`) are used on homepage and problem page; update them in your AdSense account.
- You can create different units (banner, in-article). For fixed sizes, omit `format='auto'` and use container CSS to size the `ins`.
