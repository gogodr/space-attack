"""Pack generated RGBA animation sheets into the runtime atlas (requires Pillow).

Only crops, uniformly resizes and packs generated art; does not draw assets.
Run from any directory: python scripts/pack-sprites.py
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art' / 'sprites'
OUTPUT = ROOT / 'public' / 'assets' / 'sprites'
CELL, COLUMNS, ROWS, CONTENT = 128, 8, 4, 112
SHEETS = ['player', 'enemy-a', 'enemy-b', 'enemy-c', 'explosion', 'cancel', 'lasers']
CLIPS = {
    'player': {'first': 0, 'count': 4, 'fps': 10},
    'enemy-a': {'first': 4, 'count': 4, 'fps': 6},
    'enemy-b': {'first': 8, 'count': 4, 'fps': 7},
    'enemy-c': {'first': 12, 'count': 4, 'fps': 8},
    'explosion': {'first': 16, 'count': 4, 'fps': 10},
    'cancel': {'first': 20, 'count': 4, 'fps': 10},
    'laser-player': {'first': 24, 'count': 2, 'fps': 12},
    'laser-enemy': {'first': 26, 'count': 2, 'fps': 8},
}


def frames(name):
    image = Image.open(SOURCE / f'{name}.png').convert('RGBA')
    assert image.getchannel('A').getextrema()[0] == 0, f'{name}: missing transparency'
    w, h = image.size
    result = []
    for row in range(2):
        for column in range(2):
            frame = image.crop((column * w // 2, row * h // 2,
                                (column + 1) * w // 2, (row + 1) * h // 2))
            bounds = frame.getchannel('A').getbbox()
            assert bounds, f'{name}: empty frame'
            result.append(frame.crop(bounds))
    # One scale per sheet preserves size changes, especially in explosions.
    scale = CONTENT / max(max(frame.size) for frame in result)
    return [frame.resize((max(1, round(frame.width * scale)),
                          max(1, round(frame.height * scale))), Image.Resampling.NEAREST)
            for frame in result]


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    atlas = Image.new('RGBA', (CELL * COLUMNS, CELL * ROWS))
    metadata = []
    for name in SHEETS:
        for frame in frames(name):
            index = len(metadata)
            x, y = (index % COLUMNS) * CELL, (index // COLUMNS) * CELL
            atlas.paste(frame, (x + (CELL - frame.width) // 2,
                                y + (CELL - frame.height) // 2))
            metadata.append({'index': index, 'x': x, 'y': y, 'width': CELL, 'height': CELL})
    assert len(metadata) == 28
    for item in metadata:
        x, y = item['x'], item['y']
        edges = [(x, y, x + CELL, y + 8), (x, y + CELL - 8, x + CELL, y + CELL),
                 (x, y, x + 8, y + CELL), (x + CELL - 8, y, x + CELL, y + CELL)]
        for edge in edges:
            assert atlas.crop(edge).getchannel('A').getextrema() == (0, 0), 'Nontransparent gutter'
    atlas.save(OUTPUT / 'space-attack-atlas.png', optimize=True)
    manifest = {'image': 'space-attack-atlas.png', 'width': atlas.width, 'height': atlas.height,
                'cell': CELL, 'columns': COLUMNS, 'gutter': 8, 'clips': CLIPS, 'frames': metadata}
    (OUTPUT / 'atlas.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f'Packed {len(metadata)} frames: {atlas.width}x{atlas.height} RGBA atlas')


if __name__ == '__main__':
    main()
