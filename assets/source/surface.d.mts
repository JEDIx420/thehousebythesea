export interface HeightMap {levels?:{height:number;polygon:number[][]}[];ramps?:{rect:number[];axis:string;from:number;to:number}[];}
export function inside(x:number,z:number,polygon:readonly number[][]):boolean;
export function heightAtLocal(map:HeightMap,x:number,z:number):number;
export function traversable(map:HeightMap,from:{x:number;z:number},to:{x:number;z:number},radius?:number):boolean;
