import os
import sys
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

def epub_to_html(epub_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    print(epub_path)
    print(output_dir)
    
    book = epub.read_epub(epub_path)

    # Process each item in the EPUB
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            # Parse the HTML content
            soup = BeautifulSoup(item.content, 'html.parser')

            # Create a filename for the HTML file
            filename = f"{item.get_id()}.html"
            file_path = os.path.join(output_dir, filename)

            # Save the HTML content to a file
            with open(file_path, 'w', encoding='utf-8') as html_file:
                html_file.write(str(soup))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python epub_converter.py <epub_path> <output_dir>")
        sys.exit(1)
    
    epub_path, output_dir = sys.argv[1], sys.argv[2]
    epub_to_html(epub_path, output_dir)