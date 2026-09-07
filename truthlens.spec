# -*- mode: python ; coding: utf-8 -*-
# PyInstaller Spec file for AI TruthLens Desktop Application

import os
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

block_cipher = None

# Collect model checkpoints and transformer configurations
transformers_datas = collect_data_files('transformers')
torch_datas = collect_data_files('torch')

# Collect application static assets and templates
app_datas = [
    ('templates', 'templates'),
    ('static', 'static'),
    ('config.py', '.'),
] + transformers_datas + torch_datas

hidden_imports = [
    'transformers',
    'torch',
    'torchvision',
    'PIL',
    'PIL.Image',
    'PIL.ExifTags',
    'numpy',
    'flask',
    'webview',
    'webview.platforms.qt',
    'webview.platforms.cocoa',
    'webview.platforms.winforms',
    'webview.platforms.edgechromium',
] + collect_submodules('transformers')

a = Analysis(
    ['desktop_launcher.py'],
    pathex=['.'],
    binaries=[],
    datas=app_datas,
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'scipy'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='TruthLens',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # Set to True during debugging, False for final desktop app
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='TruthLens',
)
