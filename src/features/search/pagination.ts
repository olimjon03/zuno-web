export function mergeFeedItems<T extends {id:string}>(current:T[],incoming:T[]) {
 const existing=new Set(current.map(item=>item.id));
 return [...current,...incoming.filter(item=>{if(existing.has(item.id))return false;existing.add(item.id);return true;})];
}
