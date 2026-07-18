import os
import sys

# Ensure pillow is installed
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Installing Pillow...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

def generate_icon(size, output_path):
    # Create image with transparent background or deep dark background matching theme
    img = Image.new("RGBA", (size, size), (6, 9, 19, 255)) # match #060913
    draw = ImageDraw.Draw(img)
    
    # Draw geometric green lens emblem
    # Draw outer ring
    padding = size // 6
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        outline=(16, 185, 129, 255), # emerald-500
        width=max(4, size // 24)
    )
    
    # Draw inner circle/lens core
    inner_padding = size // 3
    draw.ellipse(
        [inner_padding, inner_padding, size - inner_padding, size - inner_padding],
        fill=(16, 185, 129, 30), # 15% opacity emerald
        outline=(59, 130, 246, 255), # blue-500
        width=max(2, size // 48)
    )
    
    # Draw focal dot
    dot_radius = size // 16
    center = size // 2
    draw.ellipse(
        [center - dot_radius, center - dot_radius, center + dot_radius, center + dot_radius],
        fill=(16, 185, 129, 255)
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Generated icon: {output_path} ({size}x{size})")

if __name__ == "__main__":
    generate_icon(192, "public/icons/icon-192x192.png")
    generate_icon(512, "public/icons/icon-512x512.png")
