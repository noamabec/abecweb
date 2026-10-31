// Simple text pages: shared header and footer only.
import { renderLayout } from './layout.js?v=2';
import { initCommon } from './common.js';

renderLayout({ base: document.body.dataset.base || '' });
initCommon();
