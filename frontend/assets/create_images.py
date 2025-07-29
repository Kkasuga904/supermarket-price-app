#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw

# Create assets directory if it doesn't exist
os.makedirs('assets', exist_ok=True)

# Create basic placeholder images
def create_placeholder_image(size, color, filename):
    image = Image.new('RGBA', size, color)
    draw = ImageDraw.Draw(image)
    
    # Add simple text or shapes for different icons
    if 'icon' in filename:
        # Draw a simple shopping cart icon placeholder
        draw.rectangle([size[0]//4, size[1]//4, 3*size[0]//4, 3*size[1]//4], 
                      fill=(255, 255, 255, 255), outline=(0, 0, 0, 255), width=2)
    elif 'splash' in filename:
        # Draw simple splash screen
        draw.text((size[0]//2-50, size[1]//2), "スーパー価格比較", fill=(0, 0, 0, 255))
    
    image.save(filename)
    print(f"Created {filename}")

# Create required images
create_placeholder_image((1024, 1024), (70, 130, 180, 255), 'assets/icon.png')
create_placeholder_image((1024, 1024), (70, 130, 180, 255), 'assets/adaptive-icon.png')
create_placeholder_image((1242, 2208), (255, 255, 255, 255), 'assets/splash.png')
create_placeholder_image((32, 32), (70, 130, 180, 255), 'assets/favicon.png')

print("All placeholder images created successfully!")