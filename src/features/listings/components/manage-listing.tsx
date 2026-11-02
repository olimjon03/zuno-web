"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import type { CountryCode } from "@/features/locations/catalog";
import { priceLabel } from "../currency";
import { EditListingPhotos, type PhotoEditorHandle } from "./edit-listing-photos";
import { ListingLocationFields, optionCountry } from "./listing-location-fields";
import { manageListing } from "../server/actions";
import type { ManageResult,OwnedListing } from "../types";
import { conditions, conditionLabels } from "../constants";
import { formatMoney as formatPrice } from "../currency";
import type { LookupOption } from "../types";
function CoverPhoto({photoId,title}:{photoId?:string;title:string}) {
 const [failed,setFailed]=useState(false);
 return <span className="owned-cover">{photoId && !failed ? <Image src={`/listing-photos/${photoId}`} alt={`Cover photo of ${title}`} width={112} height={112} unoptimized onError={()=>setFailed(true)}/> : <span className="owned-cover-placeholder" role="img" aria-label="No product photo"><Icon name="image"/></span>}</span>;
}
export function ManageListing({item,categories,neighborhoods}:{item:OwnedListing;categories:LookupOption[];neighborhoods:LookupOption[]}) {
 const area=neighborhoods.find(n=>n.id===item.neighborhood_id);
 const originalCountry=optionCountry(area);
 const [country,setCountry]=useState<CountryCode|"">(originalCountry ?? "");
 const [draft,setDraft]=useState({...item,price:String(item.price)});
 const [result,setResult]=useState<ManageResult>({});
 const [pending,setPending]=useState(false);
 const locked=useRef(false);
 const photoEditor=useRef<PhotoEditorHandle>(null);
 const update=(field:keyof OwnedListing,value:string|number)=>setDraft(current=>({...current,[field]:value}));
 const orderedPhotos=[...item.photos].sort((a,b)=>a.sort_order-b.sort_order);
 const statusName=item.status==="sold" ? "Sold" : item.status==="reserved" ? "Reserved" : "Available";
 async function submit(event:FormEvent<HTMLFormElement>) {
  event.preventDefault();if(locked.current)return;
  const form=new FormData(event.currentTarget);
  const submitter=(event.nativeEvent as SubmitEvent).submitter;
  const intent=submitter instanceof HTMLButtonElement ? submitter.value : "edit";
  form.set("id",item.id);form.set("intent",intent);
  const photosForSave=photoEditor.current;
  if(intent==="edit"){
   const issue=photosForSave?.validate();
   if(issue){setResult({error:issue});return;}
   form.set("title",draft.title);form.set("price",draft.price);form.set("condition",draft.condition);
   form.set("categoryId",String(draft.category_id));form.set("neighborhoodId",String(draft.neighborhood_id));
   form.set("description",draft.description);
  }
  locked.current=true;setPending(true);setResult({});
  try {
   const saved=await manageListing({},form);
   if(saved.error){setResult(saved);return;}
   if(intent==="edit"){
    const photoResult=await photosForSave?.save();
    if(photoResult?.error){setResult({error:"Item details saved. Photos could not be saved; check the photo section and retry."});return;}
   }
   setResult(saved);
  }catch{setResult({error:"We couldn’t confirm your changes. Your draft has been kept; please try again."});}
  finally{locked.current=false;setPending(false);}
 }
 return <article className="owned-item owned-soft-card" aria-label={item.title} aria-busy={pending}>
  <div className="owned-product-card">
   <div className="owned-product-copy"><h2><Link href={`/listings/${item.id}`}>{item.title}</Link></h2><p className="owned-price">{formatPrice(Number(item.price),originalCountry)}</p><p className="owned-area"><Icon name="pin"/>{area?.name ?? "Nearby"}</p><span className={`owned-status owned-status-${item.status}`}>{statusName}</span></div>
   <Link href={`/listings/${item.id}`} className="owned-cover-link" aria-label={`View ${item.title}`}><CoverPhoto key={orderedPhotos[0]?.id ?? "missing"} photoId={orderedPhotos[0]?.id} title={item.title}/></Link>
  </div>
  <form className="owned-status-actions" onSubmit={submit} aria-label={`Change status of ${item.title}`}>
   <button type="submit" name="intent" value="reserved" disabled={pending||item.status==="reserved"}><Icon name="clock"/><span>Mark reserved</span></button>
   <button type="submit" name="intent" value="sold" disabled={pending||item.status==="sold"}><Icon name="bag-check"/><span>Mark sold</span></button>
  </form>
  <details className="owned-edit-panel">
   <summary><Icon name="pencil"/><span>Edit item details</span><Icon name="chevron" className="owned-disclosure-arrow"/></summary>
   <form className="sell-form owned-edit-form" onSubmit={submit}>
    <fieldset disabled={pending}><legend className="sr-only">Edit {item.title}</legend>
     <div className="sell-field"><label htmlFor={`${item.id}-title`}>Title</label><input id={`${item.id}-title`} name="title" value={draft.title} onChange={e=>update("title",e.target.value)} required minLength={3} maxLength={120}/></div>
     <div className="sell-field"><label htmlFor={`${item.id}-price`}>Price ({priceLabel(country)})</label><input id={`${item.id}-price`} name="price" type="number" inputMode="numeric" min={0} max={1000000000000} step={1} required value={draft.price} onChange={e=>update("price",e.target.value)}/></div>
     <EditListingPhotos key={orderedPhotos.map(p=>`${p.id}:${p.sort_order}`).join(",")} ref={photoEditor} listingId={item.id} initial={orderedPhotos} disabled={pending}/>
     <div className="sell-fields">
      <div className="sell-field"><label htmlFor={`${item.id}-condition`}>Condition</label><select id={`${item.id}-condition`} name="condition" value={draft.condition} onChange={e=>update("condition",e.target.value)}>{conditions.map(c=><option key={c} value={c}>{conditionLabels[c]}</option>)}</select></div>
      <div className="sell-field"><label htmlFor={`${item.id}-category`}>Category</label><select id={`${item.id}-category`} name="categoryId" value={draft.category_id} onChange={e=>update("category_id",Number(e.target.value))}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
     </div>
     <ListingLocationFields id={item.id} country={country} neighborhoodId={draft.neighborhood_id ? String(draft.neighborhood_id) : ""} options={neighborhoods} onCountry={setCountry} onNeighborhood={value=>update("neighborhood_id",value ? Number(value) : 0)}/>
     <div className="sell-field"><label htmlFor={`${item.id}-status`}>Availability</label><select key={item.status} id={`${item.id}-status`} name="status" defaultValue={item.status}><option value="active">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option></select></div>
     <div className="sell-field"><label htmlFor={`${item.id}-description`}>Description</label><textarea id={`${item.id}-description`} name="description" required minLength={10} maxLength={5000} rows={4} value={draft.description} onChange={e=>update("description",e.target.value)}/></div>
     <p className="auth-hint">Changing country changes the price currency. Enter the appropriate amount; prices are not converted.</p>
     <button className="button button-primary owned-save-button" name="intent" value="edit">{pending ? "Saving changes…" : "Save changes"}</button>
    </fieldset>
   </form>
  </details>
  <details className="owned-remove-panel"><summary><Icon name="trash"/><span>Remove item</span><Icon name="chevron" className="owned-disclosure-arrow"/></summary><form onSubmit={submit}><fieldset disabled={pending}><legend className="sr-only">Remove {item.title}</legend><p>This hides the item and its photos from the marketplace.</p><label className="remove-confirm"><input name="confirm" type="checkbox" value="yes" required/>Confirm removal of this item</label><button className="button button-outline owned-remove-button" name="intent" value="remove"><Icon name="trash"/>Remove item</button></fieldset></form></details>
  {pending&&<p role="status" className="owned-result">Saving changes…</p>}{result.error&&<p className="auth-error owned-result" role="alert">{result.error}</p>}{result.message&&<p role="status" className="owned-result">{result.message}</p>}
 </article>;
}
