"use client";
import { useEffect,useMemo,useRef,useState,useSyncExternalStore } from "react";
import type { FeedPage,FeedFilters } from "../types";
import { feedIssue,feedParams,parseFeedFilters } from "../validation";
import { mergeFeedItems } from "../pagination";
import { shuffleListings, useShuffleSeed } from "./shuffle-order";
const eventName="zuno:feed-url";
function subscribe(callback:()=>void){window.addEventListener("popstate",callback);window.addEventListener(eventName,callback);return()=>{window.removeEventListener("popstate",callback);window.removeEventListener(eventName,callback);};}
function snapshot(){return window.location.search;}
async function readPage(params:URLSearchParams,signal:AbortSignal):Promise<FeedPage>{
 const response=await fetch(`/api/marketplace?${params}`,{signal,cache:"no-store"});
 const result=await response.json();
 if(!response.ok)throw Error(result.error||"Could not load listings. Please try again.");
 if(!Array.isArray(result.items)||(result.nextCursor!==null&&typeof result.nextCursor!=="string"))throw Error("Could not read listings. Please try again.");
 return result;
}
export function useMarketplaceFeed(initialSearch:string,initialPage:FeedPage,initialError?:string){
 const search=useSyncExternalStore(subscribe,snapshot,()=>initialSearch);
 const filters=useMemo(()=>parseFeedFilters(new URLSearchParams(search)),[search]);
 const key=feedParams(filters).toString();const issue=feedIssue(filters);
 const seed=useShuffleSeed();
 const [version,setVersion]=useState(0);
 const [state,setState]=useState(()=>({...initialPage,key:feedParams(parseFeedFilters(new URLSearchParams(initialSearch))).toString(),version:0,pageStarts:[0],error:initialError??""}));
 const moreController=useRef<AbortController|null>(null);
 const [loadingMore,setLoadingMore]=useState(false);
 const changing=state.key!==key||state.version!==version;
 useEffect(()=>{
  moreController.current?.abort();
  if(issue||(!changing))return()=>{moreController.current?.abort();};
  const controller=new AbortController();
  const timer=setTimeout(()=>{
   void readPage(new URLSearchParams(key),controller.signal).then(result=>{
    if(!controller.signal.aborted)setState({...result,key,version,pageStarts:[0],error:""});
   }).catch(()=>{
    if(!controller.signal.aborted)setState(current=>({items:current.key===key?current.items:[],nextCursor:current.key===key?current.nextCursor:null,pageStarts:current.key===key?current.pageStarts:[0],key,version,error:"Listings could not be loaded. Please try again."}));
   });
  },300);
  return()=>{clearTimeout(timer);controller.abort();moreController.current?.abort();};
 },[key,version,issue,changing]);
 function update(patch:Partial<FeedFilters>,replace=false){
  const params=feedParams(parseFeedFilters(feedParams({...filters,...patch})));
  const next=params.toString();if(next===new URLSearchParams(window.location.search).toString())return;
  const url=`/${next?`?${next}`:""}${window.location.hash}`;
  window.history[replace?"replaceState":"pushState"](null,"",url);
  window.dispatchEvent(new Event(eventName));
 }
 async function loadMore(){
  if(issue||changing||moreController.current||!state.nextCursor)return;
  const controller=new AbortController();moreController.current=controller;setLoadingMore(true);
  setState(current=>({...current,error:""}));
  try{
   const params=new URLSearchParams(key);params.set("cursor",state.nextCursor);
   const result=await readPage(params,controller.signal);
   if(!controller.signal.aborted)setState(current=>current.key===key?{...current,items:mergeFeedItems(current.items,result.items),pageStarts:[...current.pageStarts,current.items.length],nextCursor:result.nextCursor,error:""}:current);
  }catch(error){if(!controller.signal.aborted)setState(current=>({...current,error:error instanceof Error?error.message:"Could not load more listings."}));}
  finally{if(moreController.current===controller){moreController.current=null;setLoadingMore(false);}}
 }
 const shuffledItems=useMemo(() => state.pageStarts.flatMap((start,index) =>
  shuffleListings(state.items.slice(start,state.pageStarts[index+1]),seed)
 ),[state.items,state.pageStarts,seed]);
 return {filters,update,items:state.items,shuffledItems,nextCursor:state.nextCursor,error:state.key===key?state.error:"",issue,changing:changing&&!issue,loadingMore,loadMore,retry:()=>setVersion(v=>v+1)};
}
