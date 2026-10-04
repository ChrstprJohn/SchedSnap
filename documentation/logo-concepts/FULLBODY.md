# Full-body mascot style exploration

The user requested complete bodies, visible eyes for future idle animation and pointer tracking, centered composition, and different art styles. This draw contains six static concept images, with no navigation or animation implementation.

| Label | Character | Art style | Character colors | Background |
| --- | --- | --- | --- | --- |
| A1 | Student / graduate | Flat geometric | Ivory #F3E5CA, navy #0F172A | Pale blue #DDE7ED |
| A2 | Student / graduate | Rounded outline cartoon | Ivory #F3E5CA, navy #0F172A | Cream #F5F2E9 |
| B1 | Study owl | Layered paper cut | Cream #F3E5CA, navy #0F172A | Sage #E3EAE2 |
| B2 | Study owl | Soft matte 3D | Cream #F3E5CA, navy #0F172A | Pale blue #DDE7ED |
| C1 | Campus cat with graduation cap | Pixel art | Cream #F3E5CA, navy #0F172A | Pale blue #DDE7ED |
| C2 | Campus cat with graduation cap | Sticker cartoon | Terracotta #C8896D, navy #0F172A | Sage #E3EAE2 |

Prompts request each whole character centered with even padding, all essential limbs visible, and two open eye areas with distinct pupils. The user-requested art styles override the skill's default surface treatment. These are independent new generations through the built-in tool, with main-prompt constraints, preserved without retries or post-processing. The runtime does not disclose a model identifier. A raster concept does not contain separable eye or body layers; those will need to be prepared when implementing animation.

Exact prompts, output paths, dimensions, and metadata: [fullbody-students.json](fullbody-students.json), [fullbody-owls.json](fullbody-owls.json), [fullbody-cats.json](fullbody-cats.json).
