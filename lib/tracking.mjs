export function activeShipments(shipments){
  if(!Array.isArray(shipments))return [];
  return shipments.filter(item=>item&&typeof item.reference==='string'&&item.status!=='Delivered');
}
export function findShipment(shipments,reference){
  if(!Array.isArray(shipments)||typeof reference!=='string')return null;
  const normalized=reference.trim().toUpperCase();
  if(!/^MV-[0-9]{4}$/.test(normalized))return null;
  return shipments.find(item=>item.reference===normalized)??null;
}
