// Simple text pages: shared header and footer only.
import { renderLayout } from './layout.js?v=10';
import { initCommon } from './common.js?v=3';

renderLayout({ base: document.body.dataset.base || '' });
initCommon();
