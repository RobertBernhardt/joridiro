import { chrome } from '../lib.js';
import { egg404Scene } from '../scenes/egg404.js';

chrome({ dark: true });
egg404Scene(document.getElementById('lost'));
