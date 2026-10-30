// Simple text pages: shared header and footer only.
import { renderLayout } from './layout.js';
import { initCommon } from './common.js';

renderLayout({ base: document.body.dataset.base || '' });
initCommon();
