import { rgbOf } from './util.js';
export const LP = (hs, hg, hi, sc, si, sd, o = {}) => ({ hs: rgbOf(hs), hg: rgbOf(hg), hi, sc: rgbOf(sc), si, sd, fi: o.fi || 0, fc: rgbOf(o.fc || '#ffffff'), st: o.st || [0, 0, 0], ss: o.ss || 11.5, fd: o.fd || [14, 10, 18] });
export const LK = (hs, hg, hi, sc, si, sd, fi, fc, fd, st, ss) => LP(hs, hg, hi, sc, si, sd, { fi, fc, fd, st, ss });
