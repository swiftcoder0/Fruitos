"""
Real pixel-based heuristic quality analysis — NOT a trained ML model, but
genuinely reads the uploaded photo's pixels and produces a number that
varies with the actual image, instead of always returning the same
hardcoded value. Uses only Pillow (already a dependency for QR codes),
no new packages needed.

Honest framing for the pitch: this is a "computer-vision heuristic",
not "AI-powered deep learning" — say that plainly if a judge asks. The
logic: bruising, rot, and fungal spots tend to show up as dark or
brownish patches on produce, so we measure how much of the photo is
dark/brown as a defect proxy.
"""
from PIL import Image, ImageStat
import io


def analyze_quality(image_bytes: bytes) -> dict:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        # Not a valid/readable image — fail safe, never crash the endpoint
        return {
            "ripeness": "Unknown",
            "bruising": "Unknown",
            "defects": "Unknown",
            "quality_index": 0.5,
            "details": "Could not read image — defaulted to a neutral score.",
        }

    image = image.resize((100, 100))  # downsample for speed
    grayscale = image.convert("L")

    # Dark-pixel fraction — proxy for bruising/rot/fungal spots
    histogram = grayscale.histogram()
    total_pixels = sum(histogram)
    dark_pixels = sum(histogram[:60])  # brightness 0-59 out of 255
    dark_fraction = dark_pixels / total_pixels if total_pixels else 0.0

    # Brownish-pixel fraction — another bruise/rot proxy (R > G > B, mid brightness)
    pixels = list(image.getdata())
    brown_count = sum(
        1 for (r, g, b) in pixels
        if r > g > b and 30 < (r + g + b) / 3 < 120
    )
    brown_fraction = brown_count / len(pixels) if pixels else 0.0

    defect_score = min(1.0, dark_fraction * 1.5 + brown_fraction * 1.2)
    quality_index = round(max(0.0, min(1.0, 1.0 - defect_score * 0.7)), 2)

    if quality_index > 0.8:
        ripeness = "Good"
    elif quality_index > 0.6:
        ripeness = "Medium"
    else:
        ripeness = "Overripe/Damaged"

    if defect_score < 0.1:
        bruising = defects = "Low"
    elif defect_score < 0.3:
        bruising = defects = "Medium"
    else:
        bruising = defects = "High"

    return {
        "ripeness": ripeness,
        "bruising": bruising,
        "defects": defects,
        "quality_index": quality_index,
        "details": (
            f"Heuristic pixel analysis (not a trained model): "
            f"dark-pixel fraction={dark_fraction:.2f}, "
            f"brown-pixel fraction={brown_fraction:.2f}, "
            f"defect_score={defect_score:.2f}."
        ),
    }