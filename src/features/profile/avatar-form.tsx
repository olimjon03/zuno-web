"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AvatarForm() {
 const router=useRouter();const [pending,setPending]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
 return <form method="post" encType="multipart/form-data" className="auth-form avatar-form" aria-busy={pending} onSubmit={async event=>{event.preventDefault();const form=event.currentTarget;setError("");setMessage("");setPending(true);try{const response=await fetch("/api/profile/avatar",{method:"POST",body:new FormData(form)});const result=await response.json();if(!response.ok) setError(result.error || "Photo upload failed.");else{setMessage(result.message);form.reset();router.refresh();}}catch{setError("We couldn’t connect. Please try again.");}finally{setPending(false);}}}>
 <h2>Profile photo</h2><p className="auth-hint" id="avatar-help">Your photo is public. Use a still JPG, PNG or WebP image up to 3 MB. Uploading a new photo replaces the current one.</p><label htmlFor="avatar-photo">Choose a profile photo</label><input id="avatar-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required disabled={pending} aria-describedby="avatar-help"/><button className="button button-primary" disabled={pending}>{pending ? "Uploading…" : "Save photo"}</button>{error&&<p role="alert" className="auth-error">{error}</p>}{message&&<p role="status" className="profile-success">{message}</p>}</form>;
}
