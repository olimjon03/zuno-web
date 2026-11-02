// Keep ten images below the hosting request limit. Originals stay on the device.
export async function preparePhotos(files: File[]): Promise<File[]> {
  const result: File[] = [];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 24000000) throw new Error("Choose photos up to 24 megapixels.");
      let dimension = 1600;
      let blob: Blob | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const scale = Math.min(1, dimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1,Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1,Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your browser could not prepare this photo.");
        context.drawImage(image,0,0,canvas.width,canvas.height);
        blob = await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",0.8));
        if (blob && blob.size <= 320 * 1024) break;
        dimension = Math.round(dimension * 0.75);
      }
      if (!blob || blob.size > 320 * 1024 || !["image/webp","image/png","image/jpeg"].includes(blob.type)) throw new Error("This photo could not be reduced. Please choose a smaller image.");
      result.push(new File([blob],`photo-${result.length}.${blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg"}`,{type:blob.type}));
    } finally { URL.revokeObjectURL(url); }
  }
  return result;
}
