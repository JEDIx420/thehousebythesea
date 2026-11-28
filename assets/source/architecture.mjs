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
export function market(){const c=new PixelCanvas(144,160);c.ellipse(72,141,53,12,rgba(P.deep,72));
 poly(c,[[20,112],[72,138],[124,112],[72,86]],'wood');poly(c,[[20,112],[72,138],[72,151],[20,125]],'woodDark');poly(c,[[72,138],[124,112],[124,125],[72,151]],'wood');
 poly(c,[[14,62],[68,35],[130,62],[76,91]],'blueDark');for(let i=0;i<8;i++)c.line(17+i*7,61-i*3.4,76+i*6.2,89-i*3.1,i%2?P.cream:P.blueLight,6);
 for(const[x,y]of [[20,65],[121,66]])c.rect(x,y,3,61,P.woodDark);
 c.line(20,112,71,137,P.woodLight,3);c.line(73,137,122,113,P.woodLight,3);
 for(let i=0;i<6;i++){const x=37+i*10,y=111+(i<3?i*4:(6-i)*3);c.ellipse(x,y,8,3,P.blueDark);c.line(x-5,y,x+5,y-1,P.blueLight);c.pixel(x-3,y-1,P.cream);}
 return c;}
export function gardenHouse(){const c=new PixelCanvas(160,200);c.ellipse(80,172,60,13,rgba(P.deep,72));
 poly(c,[[25,89],[81,117],[81,171],[25,143]],'cream');poly(c,[[81,117],[137,89],[137,143],[81,171]],'wallShade');
 poly(c,[[16,89],[55,42],[81,113]],'coral');poly(c,[[55,42],[145,84],[81,113]],'coralDark');c.line(56,43,143,85,P.coralLight,2);
 poly(c,[[91,63],[123,47],[143,76],[111,93]],'blue');poly(c,[[91,63],[111,93],[111,111],[91,101]],'cream');c.rect(107,85,11,14,P.blueDark);
 poly(c,[[38,106],[52,113],[52,145],[38,138]],'blueDark');c.line(45,111,45,140,P.gold);
 poly(c,[[90,127],[106,119],[106,158],[90,166]],'blueDark');c.line(104,133,104,137,P.gold);
 poly(c,[[75,137],[123,114],[143,126],[95,151]],'wood');c.line(94,151,94,177,P.woodDark,2);c.line(138,130,138,151,P.woodDark,2);
 c.line(95,174,139,151,P.woodLight,3);c.rect(31,147,15,10,P.woodDark);c.ellipse(37,143,10,6,P.leaf);c.ellipse(44,144,8,5,P.leafLight);
 return c;}
export function beacon(){const c=new PixelCanvas(96,176);c.ellipse(48,153,27,9,rgba(P.deep,72));
 poly(c,[[26,70],[49,82],[69,72],[66,145],[49,156],[29,146]],'plaster');poly(c,[[49,82],[69,72],[66,145],[49,156]],'wallShade');
 poly(c,[[24,67],[48,53],[72,67],[49,82]],'sandLight');c.line(27,96,49,108,P.sandShade,2);c.line(49,108,68,98,P.woodLight,2);c.line(28,125,49,137,P.sandShade);
 poly(c,[[30,40],[48,31],[66,40],[66,65],[48,74],[30,64]],'blueDark');poly(c,[[33,43],[47,37],[47,67],[33,60]],'gold');poly(c,[[50,37],[63,43],[63,60],[50,67]],'sandLight');
 c.line(31,52,64,51,P.woodDark,2);poly(c,[[24,39],[48,15],[72,39],[48,50]],'blue');c.line(48,15,71,38,P.blueLight,2);
 c.rect(47,3,2,17,P.woodDark);c.poly([[49,3],[64,8],[49,11]],P.coral);
 c.rect(43,129,10,23,P.blueDark);c.line(44,111,44,117,P.blueDark,2);return c;}
export function netShed(){const c=new PixelCanvas(144,176);c.ellipse(72,152,55,11,rgba(P.deep,72));poly(c,[[20,98],[72,124],[124,98],[124,129],[72,155],[20,129]],'woodDark');
 poly(c,[[20,61],[72,86],[72,151],[20,124]],'wood');poly(c,[[72,86],[124,61],[124,124],[72,151]],'woodDark');poly(c,[[11,60],[64,29],[134,60],[74,91]],'blueDark');poly(c,[[11,60],[64,29],[74,87]],'blueLight');
 for(let i=0;i<6;i++){c.line(25,72+i*8,69,94+i*8,P.woodLight);c.line(75,94+i*8,121,71+i*8,P.wood);}
 poly(c,[[82,103],[101,93],[101,136],[82,146]],'ink');c.line(94,101,94,139,P.wood,2);
 for(let x=28;x<62;x+=5)c.line(x,100+(x-28)*.5,x+3,126+(x-28)*.4,P.sandLight);
 for(let y=104;y<132;y+=6)c.line(28,y,63,y+16,P.sandShade);return c;}
