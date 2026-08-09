import qrcode
import base64
from io import BytesIO

def generate_qr_base64(batch_id: str) -> str:
    """
    Generate a QR code for a batch ID and return as base64 string.
    The QR code can be displayed as an image in HTML.
    """
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(f"Batch:{batch_id}")   # Simple text, can later be a URL
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Save to bytes buffer
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # Return as data URI for easy embedding
    return f"data:image/png;base64,{img_base64}"