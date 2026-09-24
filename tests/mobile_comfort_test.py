#!/usr/bin/env python3
"""Exercise the shipped plugin against the current DSH mobile layout contract."""
import os
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CLIENT = ROOT / 'lib/client.js'
DSH_ROOT = Path(os.environ.get('DSH_PACKAGE_ROOT',
               Path.home() / '.local/lib/node_modules/@deepseek-ai/dsh'))
LAYOUT = DSH_ROOT / 'node_modules/@deepseek-ai/dsh-client-ui-layout/lib/client.js'

source = CLIENT.read_text()
assert 'data-details-collapsed' not in source
assert source.count('data-rightbar-collapsed') >= 16
if LAYOUT.is_file():
  assert '"data-rightbar-collapsed": cols.rightbar === 0' in LAYOUT.read_text()

HTML = '''<meta name="viewport" content="width=device-width,initial-scale=1"><style>
body { margin: 0; }
#root > .frame { display: grid; position: relative;
  grid-template-columns: 280px minmax(0,1fr) 0px; height: 100vh; }
aside { width: 280px; }
#outside { position: absolute; left: 320px; top: 400px; }
</style>
<div id="root"><div class="frame" data-rightbar-collapsed="true">
  <aside><button aria-label="Collapse sidebar">Close</button>
    <div role="treeitem" aria-selected="false">Session</div></aside>
  <main><header class="wSkVaW_header">Heading</header><button id="outside">Outside</button></main><div></div>
</div></div>'''


def mount(page):
  page.set_content(HTML)
  page.evaluate('''() => {
    window.__ModuleLoader__ = {load({factory}) { window.mobileComfort = factory(() => {}); }};
    window.closeCount = 0;
    window.outsideCount = 0;
    document.querySelector('#outside').addEventListener('click', () => { window.outsideCount += 1; });
    document.querySelector('button[aria-label="Collapse sidebar"]').addEventListener('click', () => {
      window.closeCount += 1;
      document.querySelector('.frame').setAttribute('data-sidebar-collapsed', 'true');
    });
  }''')
  page.add_script_tag(path=str(CLIENT))
  page.evaluate('window.mobileComfort.apply({effect(fn) { window.disposeMobile = fn(); }});')


with sync_playwright() as playwright:
  executable = os.environ.get('DSH_TEST_CHROMIUM') or shutil.which('microsoft-edge')
  browser = playwright.chromium.launch(headless=True, **({'executable_path': executable} if executable else {}))
  try:
    phone = browser.new_context(viewport={'width': 393, 'height': 852},
                                is_mobile=True, has_touch=True)
    page = phone.new_page()
    mount(page)
    mobile = page.evaluate('''() => {
      const frame = document.querySelector('.frame');
      return {coarse: matchMedia('(hover: none) and (pointer: coarse)').matches,
        grid: getComputedStyle(frame).gridTemplateColumns,
        position: getComputedStyle(frame.firstElementChild).position,
        center: frame.children[1].getBoundingClientRect().width};
    }''')
    assert mobile['coarse'] and mobile['grid'].split()[0] == '0px', mobile
    assert mobile['position'] == 'absolute', mobile
    assert mobile['center'] == 393, mobile
    page.touchscreen.tap(350, 400)
    assert page.evaluate('window.closeCount') == 1
    assert page.evaluate('window.outsideCount') == 0
    closed = page.evaluate('''() => {
      const frame = document.querySelector('.frame');
      frame.setAttribute('data-sidebar-collapsed', 'true');
      return {grid: getComputedStyle(frame).gridTemplateColumns,
        center: frame.children[1].getBoundingClientRect().width,
        rail: frame.firstElementChild.getBoundingClientRect().height,
        header: getComputedStyle(frame.children[1].querySelector('header')).paddingLeft};
    }''')
    assert closed['grid'].split()[0] == '0px' and closed['center'] == 393, closed
    assert closed['rail'] == 72 and closed['header'] == '56px', closed
    page.get_by_role('button', name='Collapse sidebar').tap()
    assert page.evaluate('window.closeCount') == 2
    phone.close()

    desktop = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = desktop.new_page()
    mount(page)
    wide = page.evaluate('''() => {
      const frame = document.querySelector('.frame');
      return {coarse: matchMedia('(hover: none) and (pointer: coarse)').matches,
        grid: getComputedStyle(frame).gridTemplateColumns,
        position: getComputedStyle(frame.firstElementChild).position};
    }''')
    assert not wide['coarse'] and wide['grid'].split()[0] == '280px', wide
    assert wide['position'] == 'static', wide
    desktop.close()
  finally:
    browser.close()

print('MOBILE-COMFORT-OK')
