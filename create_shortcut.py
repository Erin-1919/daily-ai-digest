"""Create a Windows desktop shortcut (.lnk) for Daily AI Digest."""

import os
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DESKTOP = os.path.join(os.environ['USERPROFILE'], 'Desktop')
SHORTCUT_PATH = os.path.join(DESKTOP, 'Daily AI Digest.lnk')
TARGET = os.path.join(PROJECT_DIR, 'venv', 'Scripts', 'pythonw.exe')
ARGUMENTS = f'"{os.path.join(PROJECT_DIR, "app.py")}"'
ICON = os.path.join(PROJECT_DIR, 'app.ico')
WORKING_DIR = PROJECT_DIR

ps_script = f"""
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('{SHORTCUT_PATH}')
$Shortcut.TargetPath = '{TARGET}'
$Shortcut.Arguments = {ARGUMENTS}
$Shortcut.WorkingDirectory = '{WORKING_DIR}'
$Shortcut.IconLocation = '{ICON},0'
$Shortcut.Description = 'Daily AI Digest - Top 10 AI news'
$Shortcut.Save()
"""

if __name__ == '__main__':
    if not os.path.exists(ICON):
        print('Icon not found, generating...')
        subprocess.run(
            [os.path.join(PROJECT_DIR, 'venv', 'Scripts', 'python.exe'), 'generate_icon.py'],
            cwd=PROJECT_DIR,
            check=True,
        )

    result = subprocess.run(
        ['powershell', '-NoProfile', '-Command', ps_script],
        capture_output=True,
        text=True,
    )

    if result.returncode == 0:
        print(f'Shortcut created: {SHORTCUT_PATH}')
    else:
        print(f'Error creating shortcut: {result.stderr}')
