import {PixelCanvas,rgba} from '../../tools/pixel-canvas.mjs';import P from './palette.json' with {type:'json'};
const poly=(c,p,k)=>c.poly(p,P[k]);
export function cafe(){const c=new PixelCanvas(160,200);
 c.ellipse(83,171,62,15,rgba(P.deep,72));
 poly(c,[[23,112],[79,139],[137,110],[137,143],[80,172],[23,144]],'woodDark');
 poly(c,[[24,62],[80,89],[80,168],[24,140]],'cream');poly(c,[[80,89],[136,62],[136,140],[80,168]],'wallShade');
 poly(c,[[16,62],[72,29],[146,61],[81,97]],'blueDark');poly(c,[[16,61],[70,23],[81,56],[81,93]],'blue');poly(c,[[70,23],[146,59],[81,93],[81,56]],'blueDark');
 c.line(70,24,144,60,P.blueLight,2);for(let i=0;i<6;i++){c.line(28+i*8,59-i*4,80,86-i*5,P.blueLight);c.line(84,87-i*5,135-i*3,61-i*2,P.blue);}
 // Long shopfront and side porch replace the repeated tall-house silhouette.
 poly(c,[[30,86],[63,102],[63,130],[30,115]],'blueDark');c.line(46,95,46,121,P.woodLight,2);c.line(32,100,61,114,P.gold);
 poly(c,[[91,105],[110,95],[110,153],[91,162]],'woodDark');poly(c,[[94,107],[107,100],[107,152],[94,158]],'blueDark');c.rect(104,128,2,2,P.gold);
 poly(c,[[19,77],[70,100],[80,114],[23,88]],'coralDark');for(let i=0;i<7;i++)c.line(22+i*7,79+i*3,26+i*7,89+i*3,i%2?P.coral:P.cream,5);
 c.line(26,88,26,146,P.woodDark,2);c.line(73,110,73,167,P.woodDark,2);
 poly(c,[[116,82],[139,70],[139,101],[116,112]],'blueDark');c.line(127,79,127,106,P.woodLight,2);
 c.line(25,141,79,169,P.plaster,3);c.line(81,169,137,141,P.woodLight,2);
 c.rect(40,67,17,8,P.woodDark);c.line(43,70,53,74,P.gold);
 return c;}
