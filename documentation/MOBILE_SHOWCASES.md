# Mobile showcase artwork

The mobile row is the first of three independent device showcases under Find your style. It cycles Little Friends, Mascots, Patterns and Originals independently of tablet and laptop. Fixed copy is **For mobile.**, “Keep your week close, right on your lock screen.” and **View more**. View more opens /wallpapers/mobile; its four Choose a design links continue to the actual collection-filtered editor.

| Asset | Composition | Deployed file |
| --- | --- | --- |
| Little Friends | One upright pink bunny phone | public/images/collections/little-friends-mobile.webp |
| Mascots | Staggered lilac cat and ivory panda phones | public/images/collections/mascot-mobile.webp |
| Patterns | Peach checkerboard and lilac dotted phones | public/images/collections/pattern-mobile.webp |
| Originals | One angled frosted-blue phone | public/images/collections/original-mobile.webp |

Existing 1122 × 1402 portrait scenes use quality-88 WebP, white studio backgrounds and subtle contact shadows. Original PNGs, exact prompts and references remain in [mobile-showcases.json](../output/imagegen/schedsnap/mobile-showcases.json). These illustrative scenes differ from actual editor previews and exports, which use the Canvas renderer.

The contained 4:5 picture is capped at 460px wide and 560px high. Desktop places artwork left and copy right. Through 800px and on portrait tablets through 1100px, artwork stacks above countdown and centered copy; chevrons flank the image. The image/control row is capped at 580px. Controls retain 44px targets; stacked actions are capped at 320px.

Rotation advances every five seconds while at least a quarter of the row is visible. Mouse hover, control focus, hidden pages and offscreen rows pause it; reduced motion disables automatic cycling. The four-segment 80 × 2px progress line and timer pause together and retain the remaining interval. Manual changes reset both. The next image is preloaded; the live region is off during automatic cycling and polite during interaction.

Current evidence covers all 12 device states at 1440, 820, 390 and 320px widths, gallery routing and image loads, without horizontal overflow or browser errors. Visible autoplay, hover pause and offscreen pause passed. See .impeccable/review/device-showcases/verification.json and adjacent captures. Previous mobile-only audits remain historical.

See [the full device extension](DEVICE_SHOWCASES.md) for tablet/laptop provenance and design preservation. The original three-phone hero and footer branding remain unchanged.
