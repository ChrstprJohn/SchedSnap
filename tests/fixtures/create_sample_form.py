"""Create a synthetic registration-form image for upload verification, without student data."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

destination = Path(__file__).with_name('sample-registration.png')
image = Image.new('RGB', (1600, 900), 'white')
draw = ImageDraw.Draw(image)
regular = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 30)
heading = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 44)
bold = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 30)
draw.text((60, 55), 'SAMPLE REGISTRATION FORM - TEST DATA', font=heading, fill='#18291f')
draw.text((60, 125), 'Class schedule only. No real student information.', font=regular, fill='#444444')
columns = [60, 220, 950, 1110, 1400]
for x, title in zip(columns, ['Code', 'Subject', 'Days', 'Time', 'Room']):
    draw.text((x, 230), title, font=bold, fill='black')
rows = [
    ['CS 101', 'Introduction to Computing', 'MW', '8:00-9:30 AM', 'Lab 2'],
    ['GE 104', 'Mathematics in the Modern World', 'TTh', '10:00-11:30 AM', '301'],
    ['GE 105', 'Purposive Communication', 'F', '1:00-3:00 PM', '204'],
]
for i, row in enumerate(rows):
    y = 315 + i * 130
    draw.line((60, y-20, 1540, y-20), fill='#dddddd', width=2)
    for x, value in zip(columns, row):
        draw.text((x, y), value, font=regular, fill='black')
draw.text((60, 770), 'M = Monday; W = Wednesday; T = Tuesday; Th = Thursday; F = Friday', font=regular, fill='#444444')
image.save(destination)
print('Created synthetic sample registration image.')
