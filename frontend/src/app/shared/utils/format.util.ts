export function formatDate(iso: string | undefined): string {
 if(!iso) return '-'; const date=new Date(iso); if(Number.isNaN(date.getTime())) return '-';
 return date.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'});
}
export function formatDateTimeLocal(iso: string | undefined): string {
 if(!iso) return ''; const date=new Date(iso); if(Number.isNaN(date.getTime())) return '';
 const local=new Date(date.getTime()-date.getTimezoneOffset()*60000); return local.toISOString().slice(0,16);
}
export function formatPrice(price:number|undefined|null):string { return price == null ? '-' : new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(price); }
