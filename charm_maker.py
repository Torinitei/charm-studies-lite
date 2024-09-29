"""This is quite literally just to do funky stuff with black and white images"""

import os
from itertools import islice
import pyperclip
from PIL import Image

os.system("cls")
FILE = rf"{input('file: ')}"
os.system("cls")

FILE = FILE.replace('"', "")
im = Image.open(FILE)
CHARM_NAME = os.path.splitext(os.path.basename(os.path.normpath(FILE)))[0]


def batched(iterable, n):
    """Splits the large array into actual discernaable values so I don't perish"""
    # batched('ABCDEFG', 3) → ABC DEF G
    if n < 1:
        raise ValueError("n must be at least one")
    iterator = iter(iterable)
    while batch := list(islice(iterator, n)):
        yield batch


pix_val = list(im.getdata())
repix_val = []
TOTAL_COUNT = 0
for tup in pix_val:
    if tup == 0 or tup == (0, 0, 0) or tup == (0, 0, 0, 255):
        repix_val.append(0)
        TOTAL_COUNT += 1
    else:
        repix_val.append(255)
width, height = im.size
CHARM_WIDTH = width
bit_list = [(-(i % 2) + 2) for i in repix_val]
charm_solution = list(batched(bit_list, CHARM_WIDTH))

FINAL_STATE = f"state: blankCharm({CHARM_WIDTH}),"
FINAL_DIMENSIONS = f'dimensions: "{CHARM_WIDTH}x{CHARM_WIDTH}",'
FINAL_CHARM = f"solution: {charm_solution},"
FINAL_TOTAL = f"total: {TOTAL_COUNT}"

FINAL_OUTPUT = f"""\"{CHARM_NAME}\": {{
{FINAL_STATE}
{FINAL_DIMENSIONS}
{FINAL_CHARM}
{FINAL_TOTAL}
}},"""

pyperclip.copy(FINAL_OUTPUT)
print(FINAL_OUTPUT)
