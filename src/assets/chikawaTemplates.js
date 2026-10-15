const devices = ['mobile', 'tablet', 'laptop'];
const createdAt = '2026-10-14T03:24:26.000Z';

const designs = [
  ['chikawa-blossom-field-watercolor-ref1', 'Blossom Field Watercolor', 'The Chiikawa trio in a sage meadow scattered with little pink blossoms.', 'sage-blossom-meadow', '#dcebc9', '#735b58', '#8a756c', '#fffdf5', 'rgba(93, 103, 74, 0.18)'],
  ['chikawa-blossom-field-cel-ref1', 'Blossom Field Cel', 'A clean outlined take on the flower-filled green meadow and familiar trio.', 'sage-blossom-meadow', '#dcebc9', '#735b58', '#8a756c', '#fffdf5', 'rgba(93, 103, 74, 0.18)'],
  ['chikawa-blossom-field-paper-cut-ref1', 'Blossom Field Paper Cut', 'Layered soft colors bring the trio into a meadow of pink flowers.', 'sage-blossom-meadow', '#dcebc9', '#735b58', '#8a756c', '#fffdf5', 'rgba(93, 103, 74, 0.18)'],
  ['chikawa-peek-doodle', 'Little Edge Doodles', 'Tiny friends peek in around a quiet ivory center.', 'edge-peek', '#fffdf7', '#5d5351', '#817673', '#ffffff', 'rgba(115, 105, 140, 0.22)'],
  ['chikawa-peek-watercolor', 'Soft Blossom Peeks', 'Soft watercolor friends and flowers frame an open center.', 'edge-peek', '#fffdf7', '#645957', '#8d7e78', '#ffffff', 'rgba(128, 149, 118, 0.20)'],
  ['chikawa-peek-paper', 'Paper Garden Peeks', 'A paper garden border with friends peeking from the edges.', 'edge-peek', '#fffdf7', '#5d5351', '#817673', '#ffffff', 'rgba(115, 105, 140, 0.22)'],
  ['chikawa-woodland-path', 'Woodland Path', 'The Chiikawa trio walk together along a soft green forest path.', 'woodland-path', '#d6e4cf', '#43544b', '#6b7f72', '#f9fbf5', 'rgba(67, 84, 75, 0.18)'],
  ['chikawa-forest-picnic', 'Forest Picnic', 'A gentle picnic with the trio in a bright woodland clearing.', 'woodland-path', '#d6e4cf', '#43544b', '#6b7f72', '#f9fbf5', 'rgba(67, 84, 75, 0.18)'],
  ['chikawa-firefly-grove', 'Firefly Grove', 'The trio gather beneath softly glowing lights in a quiet grove.', 'woodland-path', '#d6e4cf', '#43544b', '#6b7f72', '#f9fbf5', 'rgba(67, 84, 75, 0.18)'],
  ['chikawa-cloud-country-watercolor', 'Cloud Country Watercolor', 'The trio stroll below soft clouds on a sunny green hillside.', 'cloud-country', '#d9f0fb', '#35546c', '#53758a', '#ffffff', 'rgba(53, 84, 108, 0.20)'],
  ['chikawa-cloud-country-anime', 'Cloud Country Anime', 'A bright blue sky, huge clouds and a breezy meadow for the trio.', 'cloud-country', '#d9f0fb', '#35546c', '#53758a', '#ffffff', 'rgba(53, 84, 108, 0.20)'],
  ['chikawa-cloud-country-screenprint', 'Cloud Country Screenprint', 'A sunny hill and cloudscape in a simple printed style.', 'cloud-country', '#d9f0fb', '#35546c', '#53758a', '#ffffff', 'rgba(53, 84, 108, 0.20)'],
];

export const chikawaTemplates = designs.map(([id, name, description, family, background, ink, muted, surface, line]) => {
  const deviceImages = Object.fromEntries(devices.map(device => [device, `/wallpapers/scenic/${id}/${device}.png`]));
  return {
    id, name, description, family, background, ink, muted, surface, line,
    collection: 'chiikawa', createdAt,
    containerStyle: 'solid', containerFill: true, containerShape: 'rounded',
    particleStyle: 'none', verticalPosition: -35,
    image: deviceImages.mobile, deviceImages,
  };
});
